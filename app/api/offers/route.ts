import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Offer from '@/lib/models/Offer';
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const vineyardId = searchParams.get('vineyardId');
    const region = searchParams.get('region');
    const type = searchParams.get('type');
    const minCost = searchParams.get('minCost');
    const maxCost = searchParams.get('maxCost');

    // Build query object
    const query: any = {};

    if (vineyardId) {
      query.vineyard_id = vineyardId;
    }

    if (region && region !== 'all') {
      query.region = region;
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (minCost || maxCost) {
      query.cost_per_adult = {};
      if (minCost) {
        query.cost_per_adult.$gte = parseFloat(minCost);
      }
      if (maxCost) {
        query.cost_per_adult.$lte = parseFloat(maxCost);
      }
    }

    const offers = await Offer.find(query).sort({ cost_per_adult: 1 });

    return createSuccessResponse(offers, 'Offers fetched successfully');
  } catch (error) {
    console.error('Error fetching offers:', error);
    return handleApiError(error);
  }
}
