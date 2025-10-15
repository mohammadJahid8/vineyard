import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Restaurant from '@/lib/models/Restaurant';
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Build query object
    const query: any = {};

    if (search) {
      query.$or = [
        { restaurants: { $regex: search, $options: 'i' } },
        { region: { $regex: search, $options: 'i' } },
        { sub_region: { $regex: search, $options: 'i' } },
        { actual_type: { $regex: search, $options: 'i' } },
        { approx_google_type: { $regex: search, $options: 'i' } },
        { id: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalCount = await Restaurant.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    // Fetch restaurants
    const restaurants = await Restaurant.find(query)
      .sort({ restaurants: 1 })
      .skip(skip)
      .limit(limit);

    const pagination = {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return createSuccessResponse(
      { restaurants, pagination },
      'Restaurants fetched successfully'
    );
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    
    // Remove any id field from body since we use MongoDB's _id
    delete body.id;

    const restaurant = new Restaurant(body);
    await restaurant.save();

    return createSuccessResponse(restaurant, 'Restaurant created successfully', 201);
  } catch (error) {
    console.error('Error creating restaurant:', error);
    return handleApiError(error);
  }
}
