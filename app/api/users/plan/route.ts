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

    // Create subscription for the selected plan
    await createUserSubscription(user, plan);

    return createSuccessResponse(
      { selectedPlan: user.selectedPlan, planSelectedAt: user.planSelectedAt },
      'Plan updated successfully'
    );
  } catch (error) {
    console.error('Error updating user plan:', error);
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
    });
  } catch (error) {
    console.error('Error fetching user plan:', error);
    return createErrorResponse(ErrorType.INTERNAL_SERVER_ERROR, 'Internal server error', 500);
  }
}
