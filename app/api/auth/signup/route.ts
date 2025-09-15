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

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return createErrorResponse(
        ErrorType.VALIDATION_ERROR,
        'First name, last name, and email are required',
        HttpStatus.BAD_REQUEST
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return createErrorResponse(
        ErrorType.VALIDATION_ERROR,
        'Invalid email format',
        HttpStatus.BAD_REQUEST
      );
    }

    // Validate name fields (basic validation)
    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      return createErrorResponse(
        ErrorType.VALIDATION_ERROR,
        'First name and last name must be at least 2 characters long',
        HttpStatus.BAD_REQUEST
      );
    }

    // Connect to database
    await connectDB();
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return createErrorResponse(
        ErrorType.CONFLICT,
        'An account with this email already exists. Please sign in instead.',
        HttpStatus.CONFLICT
      );
    }

    // Create new user
    const userData = {
      email: email.toLowerCase().trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: 'user',
      isActive: true,
    };

    const user = new User(userData);
    await user.save();

    // Return success response without sensitive data
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
    };

    return createSuccessResponse(
      userResponse,
      'Account created successfully. You can now sign in.',
      HttpStatus.CREATED
    );
  } catch (error) {
    return handleApiError(error);
  }
}
