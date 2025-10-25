import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Restaurant from '@/lib/models/Restaurant';
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/api-response';

// Function to normalize text for accent-insensitive search
function normalizeForSearch(text: string): string {
  return text
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .toLowerCase();
}

export async function GET(request: NextRequest) {
  try {
    
    await connectDB();

    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const type = searchParams.get('type');
    const minCost = searchParams.get('minCost');
    const maxCost = searchParams.get('maxCost');
    const minRating = searchParams.get('minRating');
    const search = searchParams.get('search');

    console.log({region, type, minCost, maxCost, minRating, search})
    // Build query object
    const query: any = {};

    // Handle region filtering with accent normalization
    let regionFilter = null;
    if (region && region !== 'all') {
      const normalizedRegion = normalizeForSearch(region);
      regionFilter = normalizedRegion;
    }

    if (type && type !== 'all') {
      // query.actual_type = type;
      query.approx_google_type = { $regex: type, $options: 'i' };
    }

    if (minCost || maxCost) {
      query.avg_est_lunch_cost = {};
      if (minCost) {
        query.avg_est_lunch_cost.$gte = parseFloat(minCost);
      }
      if (maxCost) {
        query.avg_est_lunch_cost.$lte = parseFloat(maxCost);
      }
    }

    if (minRating) {
      query.g_rating = { $gte: parseFloat(minRating) };
    }

    // Handle search with accent normalization
    let searchFilter = null;
    if (search) {
      const normalizedSearch = normalizeForSearch(search);
      searchFilter = normalizedSearch;
      // Keep the original regex search for non-accent sensitive fields
      query.$or = [
        { restaurants: { $regex: search, $options: 'i' } },
        { region: { $regex: search, $options: 'i' } },
        { actual_type: { $regex: search, $options: 'i' } },
        { approx_google_type: { $regex: search, $options: 'i' } },
      ];
    }
    console.log({query})

    // Fetch restaurants from database
    let restaurants = await Restaurant.find(query).sort({ g_rating: -1 });

    // Apply accent-insensitive filtering for region and search
    if (regionFilter || searchFilter) {
      restaurants = restaurants.filter((restaurant: any) => {
        let matchesRegion = true;
        let matchesSearch = true;

        // Check region filter with accent normalization
        if (regionFilter && restaurant.sub_region) {
          const normalizedSubRegion = normalizeForSearch(restaurant.sub_region);
          matchesRegion = normalizedSubRegion.includes(regionFilter);
        }

        // Check search filter with accent normalization for sub_region
        if (searchFilter && restaurant.sub_region) {
          const normalizedSubRegion = normalizeForSearch(restaurant.sub_region);
          const matchesSubRegion = normalizedSubRegion.includes(searchFilter);
          
          // If the original $or query didn't match but sub_region matches with normalization, include it
          if (matchesSubRegion) {
            matchesSearch = true;
          }
        }

        return matchesRegion && matchesSearch;
      });
    }

    // Limit results after filtering
    // const limitedRestaurants = restaurants.slice(0, 5);

    return createSuccessResponse(restaurants, 'Restaurants fetched successfully');
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return handleApiError(error);
  }
}
