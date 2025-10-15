import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Restaurant from '@/lib/models/Restaurant';
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Find restaurant by MongoDB _id
    const restaurant = await Restaurant.findById(params.id);

    if (!restaurant) {
      return createErrorResponse('Restaurant not found', 404);
    }

    return createSuccessResponse(restaurant, 'Restaurant fetched successfully');
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    
    // Find and update restaurant by MongoDB _id
    const restaurant = await Restaurant.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );

    if (!restaurant) {
      return createErrorResponse('Restaurant not found', 404);
    }

    return createSuccessResponse(restaurant, 'Restaurant updated successfully');
  } catch (error) {
    console.error('Error updating restaurant:', error);
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Find and delete restaurant by MongoDB _id
    const restaurant = await Restaurant.findByIdAndDelete(params.id);

    if (!restaurant) {
      return createErrorResponse('Restaurant not found', 404);
    }

    return createSuccessResponse(null, 'Restaurant deleted successfully');
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    return handleApiError(error);
  }
}
