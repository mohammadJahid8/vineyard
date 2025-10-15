import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

import User from '@/lib/models/User';
import { createErrorResponse, createSuccessResponse, ErrorType } from '@/lib/api-response';
import connectDB from '@/lib/mongodb';
import { findUserWithMethods, createUserSubscription, checkUserAccess } from '@/lib/utils/user-helpers';


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return createErrorResponse(ErrorType.UNAUTHORIZED, 'Unauthorized', 401);
    }

    const { plan } = await req.json();

    if (!plan || !['free', 'plus', 'premium', 'pro'].includes(plan)) {
      return createErrorResponse(ErrorType.VALIDATION_ERROR, 'Invalid plan selection', 400);
    }

    await connectDB();
    
    const user = await findUserWithMethods(session.user.email);
    if (!user) {
      return createErrorResponse(ErrorType.NOT_FOUND, 'User not found', 404);
    }

    // Check if user is trying to use free tier again
    if (plan === 'free' && user.hasUsedFreeTier && user.role !== 'admin') {
      return createErrorResponse(
        ErrorType.VALIDATION_ERROR, 
        'Free tier can only be used once per user. Please choose a paid plan.', 
        400
      );
    }

    // Create subscription for the selected plan
    await createUserSubscription(user, plan);

    return createSuccessResponse(
      { 
        selectedPlan: user.selectedPlan, 
        planSelectedAt: user.planSelectedAt,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        hasUsedFreeTier: user.hasUsedFreeTier
      },
      'Plan updated successfully'
    );
  } catch (error) {
    console.error('Error updating user plan:', error);
    
    // Handle specific error for free tier restriction
    if (error instanceof Error && error.message === 'Free tier can only be used once per user') {
      return createErrorResponse(
        ErrorType.VALIDATION_ERROR, 
        'Free tier can only be used once per user. Please choose a paid plan.', 
        400
      );
    }
    
    return createErrorResponse(ErrorType.INTERNAL_SERVER_ERROR, 'Internal server error', 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
        return createErrorResponse(ErrorType.UNAUTHORIZED, 'Unauthorized', 401);
    }

    await connectDB();
    
    const user = await findUserWithMethods(session.user.email);
    if (!user) {
      return createErrorResponse(ErrorType.NOT_FOUND, 'User not found', 404);
    }

    const hasAccess = await checkUserAccess(user);
    
    return createSuccessResponse({
      selectedPlan: user.selectedPlan,
      planSelectedAt: user.planSelectedAt,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
      isSubscriptionActive: user.isSubscriptionActive,
      hasAccess: hasAccess,
      isAdmin: user.role === 'admin',
      hasUsedFreeTier: user.hasUsedFreeTier, // Include this for frontend logic
    });
  } catch (error) {
    console.error('Error fetching user plan:', error);
    return createErrorResponse(ErrorType.INTERNAL_SERVER_ERROR, 'Internal server error', 500);
  }
}
