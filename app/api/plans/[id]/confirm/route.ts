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

// Confirm a plan
export async function POST(
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
    
    const plan = await Plan.findOne({
      _id: params.id,
      userId: session.user.id,
      isActive: true,
      // status: 'draft',
    });
    console.log('🚀 ~ POST ~ plan:', {
      _id: params.id,
      userId: session.user.id,
      isActive: true,
      // status: 'draft',
    },plan)

    if (!plan) {
      return createErrorResponse(
        ErrorType.NOT_FOUND,
        'Draft plan not found',
        HttpStatus.NOT_FOUND
      );
    }

    // Check if plan is expired
    if (plan.isExpired()) {
      await plan.expire();
      return createErrorResponse(
        ErrorType.NOT_FOUND,
        'Plan has expired',
        HttpStatus.NOT_FOUND
      );
    }

    // Validate plan has required data
    if (!plan.vineyards || plan.vineyards.length === 0) {
      return createErrorResponse(
        ErrorType.VALIDATION_ERROR,
        'Plan must have at least one vineyard',
        HttpStatus.BAD_REQUEST
      );
    }

    // Confirm the plan
    await plan.confirm();

    return createSuccessResponse(
      { plan },
      'Plan confirmed successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
