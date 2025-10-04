import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Vineyard from '@/lib/models/Vineyard';
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
 * GET /api/admin/vineyards/[id]
 * Get a specific vineyard by ID (admin only)
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    await connectDB();

    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse(
        ErrorType.UNAUTHORIZED,
        'Authentication required',
        HttpStatus.UNAUTHORIZED
      );
    }

    // Verify admin role
    const user = await User.findById(session.user.id);
    if (!user || !user.isAdmin()) {
      return createErrorResponse(
        ErrorType.FORBIDDEN,
        'Admin access required',
        HttpStatus.FORBIDDEN
      );
    }

    // Await params before accessing properties
    const { id } = await params;

    // Find vineyard by ID or vineyard_id
    const vineyard = await Vineyard.findOne({
      $or: [
        { _id: id },
        { vineyard_id: id }
      ]
    });

    if (!vineyard) {
      return createErrorResponse(
        ErrorType.NOT_FOUND,
        'Vineyard not found',
        HttpStatus.NOT_FOUND
      );
    }

    return createSuccessResponse(vineyard, 'Vineyard retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/admin/vineyards/[id]
 * Update a specific vineyard (admin only)
 */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await connectDB();

    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse(
        ErrorType.UNAUTHORIZED,
        'Authentication required',
        HttpStatus.UNAUTHORIZED
      );
    }

    // Verify admin role
    const user = await User.findById(session.user.id);
    if (!user || !user.isAdmin()) {
      return createErrorResponse(
        ErrorType.FORBIDDEN,
        'Admin access required',
        HttpStatus.FORBIDDEN
      );
    }

    // Await params before accessing properties
    const { id } = await params;
    const body = await request.json();

    // Find vineyard by ID or vineyard_id
    const vineyard = await Vineyard.findOne({
      $or: [
        { _id: id },
        { vineyard_id: id }
      ]
    });

    if (!vineyard) {
      return createErrorResponse(
        ErrorType.NOT_FOUND,
        'Vineyard not found',
        HttpStatus.NOT_FOUND
      );
    }

    // If vineyard_id is being updated, check for duplicates
    if (body.vineyard_id && body.vineyard_id !== vineyard.vineyard_id) {
      const existingVineyard = await Vineyard.findOne({ vineyard_id: body.vineyard_id });
      if (existingVineyard) {
        return createErrorResponse(
          ErrorType.VALIDATION_ERROR,
          'Vineyard ID already exists',
          HttpStatus.BAD_REQUEST
        );
      }
    }

    // Update vineyard fields
    const allowedUpdates = [
      'vineyard_id',
      'vineyard',
      'region',
      'sub_region',
      'type',
      'g',
      'g_ratig_user',
      'lowest_cost_per_adult',
      'highest_cost_per_adult',
      'reason_1',
      'reason_2',
      'reason_3',
      'reason_4',
      'reason_5',
      'image_url',
      'maplink',
      'latitude',
      'longitude',
      'tasting_only',
      'tour_and_tasting',
      'pairing_and_lunch',
      'vine_experience',
      'masterclass_workshop'
    ];

    const updates: any = {};
    for (const field of allowedUpdates) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return createErrorResponse(
        ErrorType.VALIDATION_ERROR,
        'No valid fields to update',
        HttpStatus.BAD_REQUEST
      );
    }

    // Update vineyard
    Object.assign(vineyard, updates);
    await vineyard.save();

    return createSuccessResponse(vineyard, 'Vineyard updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/admin/vineyards/[id]
 * Delete a specific vineyard (admin only)
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await connectDB();

    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse(
        ErrorType.UNAUTHORIZED,
        'Authentication required',
        HttpStatus.UNAUTHORIZED
      );
    }

    // Verify admin role
    const user = await User.findById(session.user.id);
    if (!user || !user.isAdmin()) {
      return createErrorResponse(
        ErrorType.FORBIDDEN,
        'Admin access required',
        HttpStatus.FORBIDDEN
      );
    }

    // Await params before accessing properties
    const { id } = await params;

    // Find and delete vineyard
    const vineyard = await Vineyard.findOneAndDelete({
      $or: [
        { _id: id },
        { vineyard_id: id }
      ]
    });

    if (!vineyard) {
      return createErrorResponse(
        ErrorType.NOT_FOUND,
        'Vineyard not found',
        HttpStatus.NOT_FOUND
      );
    }

    return createSuccessResponse(
      { id: vineyard.id, vineyard_id: vineyard.vineyard_id },
      'Vineyard deleted successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
