import { NextRequest } from 'next/server';
import { sendOTP } from '@/lib/auth/otp-service';
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
    const { email } = await request.json();

    if (!email) {
      return createErrorResponse(
        ErrorType.VALIDATION_ERROR,
        'Email is required',
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

    // Check if user exists
    await connectDB();
    const existingUser = await User.findByEmail(email);
    
    if (!existingUser) {
      return createErrorResponse(
        ErrorType.NOT_FOUND,
        'User not found. Please sign up first.',
        HttpStatus.NOT_FOUND,
        { userExists: false }
      );
    }

    const result = await sendOTP(email);

    if (result.success) {
      return createSuccessResponse(
        { email },
        'OTP sent successfully. Please check your email.'
      );
    } else {
      return createErrorResponse(
        ErrorType.INTERNAL_SERVER_ERROR,
        result.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  } catch (error) {
    return handleApiError(error);
  }
}
