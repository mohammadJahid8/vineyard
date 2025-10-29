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

    // If results are less than 3 (including zero), fetch additional recommendations
    let additionalRecommendations = [];
    if (restaurants.length < 3) {
      // Build alternative query
      const altQuery: any = {};

      if (restaurants.length > 0) {
        // If we have at least one result, use it as reference
        const referenceRestaurant = restaurants[0];
        altQuery._id = { $nin: restaurants.map((r: any) => r._id) };

        // Try to match region first
        if (referenceRestaurant.sub_region) {
          const normalizedSubRegion = normalizeForSearch(referenceRestaurant.sub_region);
          
          // Fetch restaurants from same region
          let sameRegionRestaurants = await Restaurant.find(altQuery)
            .sort({ g_rating: -1 })
            .limit(6);
          
          // Filter by normalized sub_region
          sameRegionRestaurants = sameRegionRestaurants.filter((r: any) => {
            if (r.sub_region) {
              const normalizedR = normalizeForSearch(r.sub_region);
              return normalizedR.includes(normalizedSubRegion) || normalizedSubRegion.includes(normalizedR);
            }
            return false;
          });

          if (sameRegionRestaurants.length >= 6) {
            additionalRecommendations = sameRegionRestaurants;
          } else {
            // If not enough from same region, add by similar cost
            const remainingCount = 6 - sameRegionRestaurants.length;
            const refCost = referenceRestaurant.avg_est_lunch_cost || 50;
            
            const costQuery: any = {
              _id: { 
                $nin: [
                  ...restaurants.map((r: any) => r._id),
                  ...sameRegionRestaurants.map((r: any) => r._id)
                ]
              },
              avg_est_lunch_cost: {
                $gte: Math.max(0, refCost - 15),
                $lte: refCost + 15
              }
            };

            const similarCostRestaurants = await Restaurant.find(costQuery)
              .sort({ g_rating: -1 })
              .limit(remainingCount);

            additionalRecommendations = [...sameRegionRestaurants, ...similarCostRestaurants];
          }
        } else {
          // Fallback: just get by similar cost
          const refCost = referenceRestaurant.avg_est_lunch_cost || 50;
          altQuery.avg_est_lunch_cost = {
            $gte: Math.max(0, refCost - 15),
            $lte: refCost + 15
          };

          additionalRecommendations = await Restaurant.find(altQuery)
            .sort({ g_rating: -1 })
            .limit(6);
        }
      } else {
        // No results found, show general recommendations based on filters
        // Use region filter if available
        if (regionFilter) {
          // Fetch restaurants with accent-insensitive filtering
          let allRestaurants = await Restaurant.find()
            .sort({ g_rating: -1 })
            .limit(20); // Get more than needed for filtering
          
          additionalRecommendations = allRestaurants.filter((r: any) => {
            if (r.sub_region) {
              const normalizedSubRegion = normalizeForSearch(r.sub_region);
              return normalizedSubRegion.includes(regionFilter);
            }
            return false;
          }).slice(0, 6);
        }
        
        // If no region recommendations or not enough, use cost filter
        if (additionalRecommendations.length < 6) {
          const remainingCount = 6 - additionalRecommendations.length;
          const excludeIds = additionalRecommendations.map((r: any) => r._id);
          
          const costQuery: any = {
            _id: { $nin: excludeIds }
          };
          
          if (minCost || maxCost) {
            costQuery.avg_est_lunch_cost = {};
            if (minCost) {
              costQuery.avg_est_lunch_cost.$gte = parseFloat(minCost);
            }
            if (maxCost) {
              costQuery.avg_est_lunch_cost.$lte = parseFloat(maxCost);
            }
          }

          const moreCostRestaurants = await Restaurant.find(costQuery)
            .sort({ g_rating: -1 })
            .limit(remainingCount);

          additionalRecommendations = [...additionalRecommendations, ...moreCostRestaurants];
        }
      }
    }

    return createSuccessResponse({
      restaurants,
      additionalRecommendations: additionalRecommendations.length > 0 ? additionalRecommendations : undefined
    }, 'Restaurants fetched successfully');
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return handleApiError(error);
  }
}
