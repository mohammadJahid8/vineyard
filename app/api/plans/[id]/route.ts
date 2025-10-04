import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import connectDB from '@/lib/mongodb';
import Plan from '@/lib/models/Plan';
import {
  createSuccessResponse,
  createErrorResponse,
  handleApiError,
  HttpStatus,
  ErrorType,
} from '@/lib/api-response';

// Get a specific plan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse(
        ErrorType.UNAUTHORIZED,
        'Authentication required',
        HttpStatus.UNAUTHORIZED
      );
    }

    await connectDB();
    
    // Await params before accessing properties
    const { id } = await params;
    
    const plan = await Plan.findOne({
      _id: id,
      userId: session.user.id,
      isActive: true,
    });

    if (!plan) {
      return createErrorResponse(
        ErrorType.NOT_FOUND,
        'Plan not found',
        HttpStatus.NOT_FOUND
      );
    }

    

    return createSuccessResponse({ plan }, 'Plan retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// Update a specific plan
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse(
        ErrorType.UNAUTHORIZED,
        'Authentication required',
        HttpStatus.UNAUTHORIZED
      );
    }

    const { vineyards, restaurant, title, status } = await request.json();

    await connectDB();
    
    const plan = await Plan.findOne({
      _id: params.id,
      userId: session.user.id,
      isActive: true,
    });

    if (!plan) {
      return createErrorResponse(
        ErrorType.NOT_FOUND,
        'Plan not found',
        HttpStatus.NOT_FOUND
      );
    }



    // Update plan fields
    if (vineyards && Array.isArray(vineyards)) {
      if (vineyards.length > 10) {
        return createErrorResponse(
          ErrorType.VALIDATION_ERROR,
          'Maximum 10 vineyards allowed',
          HttpStatus.BAD_REQUEST
        );
      }
      
      plan.vineyards = vineyards.map((v: any) => ({
        vineyardId: v.vineyard.vineyard_id,
        vineyard: v.vineyard,
        offer: v.offer,
        time: v.time,
      }));
    }

    if (restaurant !== undefined) {
      if (restaurant) {
        plan.restaurant = {
          restaurantId: restaurant.restaurant.restaurant_id || restaurant.restaurant.restaurants,
          restaurant: restaurant.restaurant,
          time: restaurant.time,
        };
      } else {
        plan.restaurant = undefined;
      }
    }

    if (title !== undefined) {
      plan.title = title;
    }

 

    await plan.save();

    return createSuccessResponse({ plan }, 'Plan updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// Delete a specific plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse(
        ErrorType.UNAUTHORIZED,
        'Authentication required',
        HttpStatus.UNAUTHORIZED
      );
    }

    await connectDB();
    
    const plan = await Plan.find({
      _id: params.id,
      userId: session.user.id,
    });

    if (!plan) {
      return createErrorResponse(
        ErrorType.NOT_FOUND,
        'Plan not found',
        HttpStatus.NOT_FOUND
      );
    }

    // Soft delete by setting isActive to false
    plan.isActive = false;
    await plan.save();

    return createSuccessResponse(
      { planId: params.id },
      'Plan deleted successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
