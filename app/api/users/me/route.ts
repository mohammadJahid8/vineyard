import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import {
  createSuccessResponse,
  createErrorResponse,
  handleApiError,
  HttpStatus,
  ErrorType,
} from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

/**
 * GET /api/users/me
 * Get current authenticated user's profile
 */
export async function GET() {
  try {
    await connectDB();

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse(
        ErrorType.UNAUTHORIZED,
        'Authentication required',
        HttpStatus.UNAUTHORIZED
      );
    }

    // Get user from database
    const user = await User.findById(session.user.id);
    if (!user) {
      return createErrorResponse(
        ErrorType.NOT_FOUND,
        'User not found',
        HttpStatus.NOT_FOUND
      );
    }

    // Update last login
    await user.updateLastLogin();

    // Remove sensitive data from response
    const userResponse = user.toJSON();

    return createSuccessResponse(userResponse, 'Profile retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/users/me
 * Update current user's profile
 */
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse(
        ErrorType.UNAUTHORIZED,
        'Authentication required',
        HttpStatus.UNAUTHORIZED
      );
    }

    const body = await request.json();

    // Get current user
    const user = await User.findById(session.user.id);
    if (!user) {
      return createErrorResponse(
        ErrorType.NOT_FOUND,
        'User not found',
        HttpStatus.NOT_FOUND
      );
    }

    // Define what fields users can update in their own profile
    const allowedUpdates = ['firstName', 'lastName', 'username', 'imageUrl'];
    const updates: any = {};

    for (const field of allowedUpdates) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    // Users cannot update their role or active status via this endpoint
    if (body.role !== undefined || body.isActive !== undefined) {
      return createErrorResponse(
        ErrorType.FORBIDDEN,
        'Cannot modify role or active status',
        HttpStatus.FORBIDDEN
      );
    }

    if (Object.keys(updates).length === 0) {
      return createErrorResponse(
        ErrorType.VALIDATION_ERROR,
        'No valid fields to update',
        HttpStatus.BAD_REQUEST
      );
    }

    // Update user
    Object.assign(user, updates);
    await user.save();

    // Remove sensitive data from response
    const userResponse = user.toJSON();

    return createSuccessResponse(userResponse, 'Profile updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
