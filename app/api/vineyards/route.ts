import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Vineyard from '@/lib/models/Vineyard';
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const type = searchParams.get('type');
    const minCost = searchParams.get('minCost');
    const maxCost = searchParams.get('maxCost');
    const search = searchParams.get('search');

    // Build query object
    const query: any = {};

    if (region && region !== 'all') {
      query.region = region;
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (minCost || maxCost) {
      query.lowest_cost_per_adult = {};
      if (minCost) {
        query.lowest_cost_per_adult.$gte = parseFloat(minCost);
      }
      if (maxCost) {
        query.lowest_cost_per_adult.$lte = parseFloat(maxCost);
      }
    }

    if (search) {
      query.$or = [
        { vineyard: { $regex: search, $options: 'i' } },
        { region: { $regex: search, $options: 'i' } },
        { sub_region: { $regex: search, $options: 'i' } },
      ];
    }

    const vineyards = await Vineyard.find(query).sort({ vineyard: 1 });
    console.log('🚀 ~ GET ~ vineyards:')

    return createSuccessResponse(vineyards, 'Vineyards fetched successfully');
  } catch (error) {
    console.error('Error fetching vineyards:', error);
    return handleApiError(error);
  }
}
