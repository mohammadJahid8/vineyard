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

/**
 * GET /api/admin/vineyards
 * Get paginated vineyards with search (admin only)
 */
export async function GET(request: NextRequest) {
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

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      searchQuery = {
        $or: [
          { vineyard: searchRegex },
          { vineyard_id: searchRegex },
          { region: searchRegex },
          { sub_region: searchRegex },
          { type: searchRegex },
        ],
      };
    }

    // Fetch paginated vineyards with search
    const [vineyards, totalCount] = await Promise.all([
      Vineyard.find(searchQuery)
        .sort({ vineyard: 1 })
        .skip(skip)
        .limit(limit),
      Vineyard.countDocuments(searchQuery),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return createSuccessResponse(
      {
        vineyards,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      },
      'Vineyards retrieved successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/admin/vineyards
 * Create a new vineyard (admin only)
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'vineyard_id',
      'vineyard',
      'region',
      'sub_region',
      'type',
      'g',
      'g_ratig_user',
      'lowest_cost_per_adult',
      'highest_cost_per_adult'
    ];

    for (const field of requiredFields) {
      if (!body[field] && body[field] !== 0) {
        return createErrorResponse(
          ErrorType.VALIDATION_ERROR,
          `${field} is required`,
          HttpStatus.BAD_REQUEST
        );
      }
    }

    // Check if vineyard_id already exists
    const existingVineyard = await Vineyard.findOne({ vineyard_id: body.vineyard_id });
    if (existingVineyard) {
      return createErrorResponse(
        ErrorType.VALIDATION_ERROR,
        'Vineyard ID already exists',
        HttpStatus.BAD_REQUEST
      );
    }

    // Create new vineyard
    const vineyard = new Vineyard(body);
    await vineyard.save();

    return createSuccessResponse(vineyard, 'Vineyard created successfully', HttpStatus.CREATED);
  } catch (error) {
    return handleApiError(error);
  }
}
