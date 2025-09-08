import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

import User from '@/lib/models/User';
import { createErrorResponse, createSuccessResponse, ErrorType } from '@/lib/api-response';
import connectDB from '@/lib/mongodb';


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

    const user = await User.findByEmail(session.user.email);
    if (!user) {
      return createErrorResponse(ErrorType.NOT_FOUND, 'User not found', 404);
    }

    user.selectedPlan = plan;
    user.planSelectedAt = new Date();
    await user.save();

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

    const user = await User.findByEmail(session.user.email);
    if (!user) {
      return createErrorResponse(ErrorType.NOT_FOUND, 'User not found', 404);
    }

    return createSuccessResponse({
      selectedPlan: user.selectedPlan,
      planSelectedAt: user.planSelectedAt,
    });
  } catch (error) {
    console.error('Error fetching user plan:', error);
    return createErrorResponse(ErrorType.INTERNAL_SERVER_ERROR, 'Internal server error', 500);
  }
}
