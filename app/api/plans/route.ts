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

// Get user's plans
export async function GET(request: NextRequest) {
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
    
    // Clean up expired plans first
    await Plan.expireOldPlans();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type'); // 'active' or 'confirmed'

    let query: any = { userId: session.user.id };

    if (type === 'active') {
      // Get current active draft plan
      const activePlan = await Plan.findActiveByUserId(session.user.id);
      
      // Check if plan is expired
      if (activePlan && activePlan.isExpired()) {
        await activePlan.expire();
        return createSuccessResponse(
          { plan: null, expired: true },
          'Active plan has expired'
        );
      }
      
      return createSuccessResponse(
        { plan: activePlan },
        activePlan ? 'Active plan found' : 'No active plan'
      );
    } else if (type === 'confirmed') {
      // Get confirmed plans
      const confirmedPlans = await Plan.findConfirmedByUserId(session.user.id);
      return createSuccessResponse(
        { plans: confirmedPlans },
        'Confirmed plans retrieved'
      );
    } else {
      // Get all plans with optional status filter
      if (status) {
        query.status = status;
      }
      query.isActive = true;

      const plans = await Plan.find(query).sort({ createdAt: -1 });
      return createSuccessResponse({ plans }, 'Plans retrieved successfully');
    }
  } catch (error) {
    return handleApiError(error);
  }
}

// Create or update a plan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse(
        ErrorType.UNAUTHORIZED,
        'Authentication required',
        HttpStatus.UNAUTHORIZED
      );
    }

    const { vineyards, restaurant, title } = await request.json();

    if (!vineyards || !Array.isArray(vineyards) || vineyards.length === 0) {
      return createErrorResponse(
        ErrorType.VALIDATION_ERROR,
        'At least one vineyard is required',
        HttpStatus.BAD_REQUEST
      );
    }

    if (vineyards.length > 3) {
      return createErrorResponse(
        ErrorType.VALIDATION_ERROR,
        'Maximum 3 vineyards allowed',
        HttpStatus.BAD_REQUEST
      );
    }

    await connectDB();
    
    // Clean up expired plans first
    await Plan.expireOldPlans();

    // Check if user has an active draft plan (not confirmed)
    let plan = await Plan.findOne({
      userId: session.user.id,
      isActive: true,
      // status: 'draft'
    });

    // Don't set expiration time for drafts - only set when confirming

    if (plan) {
      console.log('🚀 ~ POST ~ plan:', plan)
      // Update existing plan
      plan.vineyards = vineyards.map((v: any) => ({
        vineyardId: v.vineyard.vineyard_id,
        vineyard: v.vineyard,
        offer: v.offer,
        time: v.time,
      }));
      
      if (restaurant) {
        plan.restaurant = {
          restaurantId: restaurant.restaurant.restaurant_id || restaurant.restaurant.restaurants,
          restaurant: restaurant.restaurant,
          time: restaurant.time,
        };
      } else {
        plan.restaurant = undefined;
      }
      
      if (title) {
        plan.title = title;
      }
      
      // Ensure draft plans don't have expiresAt
      if (plan.status === 'draft') {
        plan.set('expiresAt', undefined);
      }
      
      await plan.save();
    } else {
      // Create new plan (don't include expiresAt for drafts)
      const planData: any = {
        userId: session.user.id,
        vineyards: vineyards.map((v: any) => ({
          vineyardId: v.vineyard.vineyard_id,
          vineyard: v.vineyard,
          offer: v.offer,
          time: v.time,
        })),
        status: 'draft',
        expiresAt: null,
        // Don't include expiresAt for draft plans
      };

      if (restaurant) {
        planData.restaurant = {
          restaurantId: restaurant.restaurant.restaurant_id || restaurant.restaurant.restaurants,
          restaurant: restaurant.restaurant,
          time: restaurant.time,
        };
      }

      if (title) {
        planData.title = title;
      }

      plan = new Plan(planData);
      console.log('🚀 ~ POST ~ plan:', plan)
      await plan.save();
    }

    return createSuccessResponse(
      { plan },
      plan.isNew ? 'Plan created successfully' : 'Plan updated successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
