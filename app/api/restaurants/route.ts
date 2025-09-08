import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Restaurant from '@/lib/models/Restaurant';
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/api-response';

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

    // Build query object
    const query: any = {};

    if (region && region !== 'all') {
      query.region = region;
    }

    if (type && type !== 'all') {
      query.actual_type = type;
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

    if (search) {
      query.$or = [
        { restaurants: { $regex: search, $options: 'i' } },
        { region: { $regex: search, $options: 'i' } },
        { sub_region: { $regex: search, $options: 'i' } },
        { actual_type: { $regex: search, $options: 'i' } },
      ];
    }

    const restaurants = await Restaurant.find(query).sort({ g_rating: -1 });

    return createSuccessResponse(restaurants, 'Restaurants fetched successfully');
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return handleApiError(error);
  }
}
