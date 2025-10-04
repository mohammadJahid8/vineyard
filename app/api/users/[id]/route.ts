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

interface Params {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/users/[id]
 * Get a specific user by ID
 */
export async function GET(request: NextRequest, { params }: Params) {
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

    // Await params before accessing properties
    const { id } = await params;

    // Get authenticated user
    const currentUser = await User.findById(session.user.id);
    if (!currentUser) {
      return createErrorResponse(
        ErrorType.NOT_FOUND,
        'Current user not found',
        HttpStatus.NOT_FOUND
      );
    }

    // Users can only view their own profile unless they're moderators
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return createErrorResponse(
        ErrorType.NOT_FOUND,
        'User not found',
        HttpStatus.NOT_FOUND
      );
    }

    // Check permissions
    if (targetUser._id.toString() !== currentUser._id.toString() && !currentUser.isModerator()) {
      return createErrorResponse(
        ErrorType.FORBIDDEN,
        'Insufficient permissions',
        HttpStatus.FORBIDDEN
      );
    }

    return createSuccessResponse(targetUser, 'User retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/users/[id]
 * Update a specific user
 */
export async function PUT(request: NextRequest, { params }: Params) {
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

    // Await params before accessing properties
    const { id } = await params;
    const body = await request.json();

    // Get authenticated user
    const currentUser = await User.findById(session.user.id);
    if (!currentUser) {
      return createErrorResponse(
        ErrorType.NOT_FOUND,
        'Current user not found',
        HttpStatus.NOT_FOUND
      );
    }

    // Find target user
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return createErrorResponse(
        ErrorType.NOT_FOUND,
        'User not found',
        HttpStatus.NOT_FOUND
      );
    }

    // Check permissions
    const isSelfUpdate = targetUser._id.toString() === currentUser._id.toString();
    const isModerator = currentUser.isModerator();

    if (!isSelfUpdate && !isModerator) {
      return createErrorResponse(
        ErrorType.FORBIDDEN,
        'Insufficient permissions',
        HttpStatus.FORBIDDEN
      );
    }

    // Define what fields can be updated
    const allowedUpdates = ['firstName', 'lastName', 'username', 'imageUrl'];
    const moderatorOnlyUpdates = ['role', 'isActive'];

    const updates: any = {};

    // Process regular updates
    for (const field of allowedUpdates) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    // Process moderator-only updates
    if (isModerator) {
      for (const field of moderatorOnlyUpdates) {
        if (body[field] !== undefined) {
          // Validate role values
          if (field === 'role' && !['user', 'admin', 'moderator'].includes(body[field])) {
            return createErrorResponse(
              ErrorType.VALIDATION_ERROR,
              'Invalid role value',
              HttpStatus.BAD_REQUEST
            );
          }
          updates[field] = body[field];
        }
      }
    }

    // Prevent users from changing protected fields
    if (!isModerator && (body.role !== undefined || body.isActive !== undefined)) {
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
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return createSuccessResponse(updatedUser, 'User updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/users/[id]
 * Soft delete a user (set isActive to false)
 */
export async function DELETE(request: NextRequest, { params }: Params) {
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

    // Await params before accessing properties
    const { id } = await params;

    // Get authenticated user
    const currentUser = await User.findById(session.user.id);
    if (!currentUser) {
      return createErrorResponse(
        ErrorType.NOT_FOUND,
        'Current user not found',
        HttpStatus.NOT_FOUND
      );
    }
    if (!currentUser.isModerator()) {
      return createErrorResponse(
        ErrorType.FORBIDDEN,
        'Insufficient permissions',
        HttpStatus.FORBIDDEN
      );
    }

    // Find target user
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return createErrorResponse(
        ErrorType.NOT_FOUND,
        'User not found',
        HttpStatus.NOT_FOUND
      );
    }

    // Prevent deleting other admins
    if (targetUser.role === 'admin' && currentUser._id.toString() !== targetUser._id.toString()) {
      return createErrorResponse(
        ErrorType.FORBIDDEN,
        'Cannot deactivate other administrators',
        HttpStatus.FORBIDDEN
      );
    }

    // Soft delete by setting isActive to false
    targetUser.isActive = false;
    await targetUser.save();

    const userResponse = targetUser.toJSON();
    return createSuccessResponse(userResponse, 'User deactivated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
