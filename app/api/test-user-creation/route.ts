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
import { auth } from '@clerk/nextjs/server';
import { ensureUserExists } from '@/lib/utils/user-sync';

/**
 * GET /api/test-user-creation
 * Test endpoint to check user creation functionality
 */
export async function GET() {
  try {
    await connectDB();

    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(
        ErrorType.UNAUTHORIZED,
        'Authentication required',
        HttpStatus.UNAUTHORIZED
      );
    }

    console.log('Testing user creation for Clerk ID:', userId);

    // Check if user exists in database
    const existingUser = await User.findByClerkId(userId);
    
    const result: any = {
      clerkUserId: userId,
      userExistsInDB: !!existingUser,
      timestamp: new Date().toISOString(),
    };

    if (existingUser) {
      result.existingUser = {
        id: existingUser._id,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        role: existingUser.role,
        createdAt: existingUser.createdAt,
      };
    } else {
      // Try to create user
      console.log('User not found, attempting to create...');
      try {
        const newUser = await ensureUserExists(userId);
        result.userCreated = true;
        result.newUser = {
          id: newUser._id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          createdAt: newUser.createdAt,
        };
      } catch (creationError) {
        console.error('User creation failed:', creationError);
        result.userCreated = false;
        result.creationError = creationError.message;
      }
    }

    // Get total user count
    result.totalUsersInDB = await User.countDocuments();

    return createSuccessResponse(result, 'User creation test completed');
  } catch (error) {
    console.error('Test endpoint error:', error);
    return handleApiError(error);
  }
}

/**
 * POST /api/test-user-creation
 * Force create/recreate user for testing
 */
export async function POST() {
  try {
    await connectDB();

    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(
        ErrorType.UNAUTHORIZED,
        'Authentication required',
        HttpStatus.UNAUTHORIZED
      );
    }

    console.log('Force creating user for Clerk ID:', userId);

    // Delete existing user if exists
    const existingUser = await User.findByClerkId(userId);
    if (existingUser) {
      await User.deleteOne({ clerkId: userId });
      console.log('Deleted existing user');
    }

    // Create new user
    const newUser = await ensureUserExists(userId);

    const result = {
      clerkUserId: userId,
      userRecreated: true,
      newUser: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
      totalUsersInDB: await User.countDocuments(),
      timestamp: new Date().toISOString(),
    };

    return createSuccessResponse(result, 'User force created successfully');
  } catch (error) {
    console.error('Force creation error:', error);
    return handleApiError(error);
  }
}

