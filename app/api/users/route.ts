import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  handleApiError,
  HttpStatus,
  ErrorType,
} from '@/lib/api-response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

/**
 * GET /api/users
 * Retrieve users with pagination and filtering
 */
export async function GET(request: NextRequest) {
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

    // Get authenticated user to check permissions
    const currentUser = await User.findById(session.user.id);
    if (!currentUser) {
      return createErrorResponse(
        ErrorType.NOT_FOUND,
        'User not found',
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

    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100); // Max 100 per page
    const skip = (page - 1) * limit;

    // Filter parameters
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');

    // Build query
    const query: any = {};
    
    if (role && ['user', 'admin', 'moderator'].includes(role)) {
      query.role = role;
    }
    
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    // Execute queries
    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return createPaginatedResponse(
      users,
      {
        page,
        limit,
        total,
        totalPages,
      },
      'Users retrieved successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/users
 * Create a new user (admin only)
 */
export async function POST(request: NextRequest) {
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

    // Get authenticated user to check permissions
    const currentUser = await User.findById(session.user.id);
    if (!currentUser?.isAdmin()) {
      return createErrorResponse(
        ErrorType.FORBIDDEN,
        'Admin access required',
        HttpStatus.FORBIDDEN
      );
    }

    const body = await request.json();
    const { email, firstName, lastName, username, imageUrl, role } = body;

    // Validate required fields
    if (!email) {
      return createErrorResponse(
        ErrorType.VALIDATION_ERROR,
        'Email is required',
        HttpStatus.BAD_REQUEST
      );
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return createErrorResponse(
        ErrorType.CONFLICT,
        'User already exists',
        HttpStatus.CONFLICT
      );
    }

    // Create new user
    const userData = {
      email,
      firstName,
      lastName,
      username,
      imageUrl,
      role: role || 'user',
      isActive: true,
    };

    const user = new User(userData);
    await user.save();

    const userResponse = user.toJSON();
    return createSuccessResponse(
      userResponse,
      'User created successfully',
      HttpStatus.CREATED
    );
  } catch (error) {
    return handleApiError(error);
  }
}
