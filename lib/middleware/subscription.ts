import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import User from '@/lib/models/User';
import connectDB from '../mongodb';
import { findUserWithMethods, checkUserAccess } from '@/lib/utils/user-helpers';

export async function checkSubscription(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Not authenticated',
          hasAccess: false 
        }, 
        { status: 401 }
      );
    }

    await connectDB();
    const user = await findUserWithMethods(session.user.email);

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User not found',
          hasAccess: false 
        }, 
        { status: 404 }
      );
    }

    // Check if user has active subscription
    const hasAccess = await checkUserAccess(user);

    if (!hasAccess) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Subscription expired or not found',
          hasAccess: false,
          isAdmin: user.role === 'admin'
        }, 
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      hasAccess: true,
      subscription: {
        plan: user.selectedPlan,
        expiresAt: user.subscriptionExpiresAt,
        isAdmin: user.role === 'admin'
      }
    });

  } catch (error) {
    console.error('Subscription check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        hasAccess: false 
      }, 
      { status: 500 }
    );
  }
}

export async function createFreeSubscriptionForUser(email: string) {
  try {
    await connectDB();
    const user = await findUserWithMethods(email);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Don't create subscription if user already has an active one
    if (await checkUserAccess(user)) {
      return user;
    }

    // Create free subscription
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 5); // 5 minutes for testing
    
    user.selectedPlan = 'free';
    user.planSelectedAt = new Date();
    user.subscriptionExpiresAt = expirationDate;
    user.isSubscriptionActive = true;

    return await user.save();
  } catch (error) {
    console.error('Error creating free subscription:', error);
    throw error;
  }
}
