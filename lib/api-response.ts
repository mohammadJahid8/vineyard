import { NextResponse } from 'next/server';

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
}

export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    type: ErrorType;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Create a success response
 */
export function createSuccessResponse<T>(
  data: T,
  message: string = 'Success',
  status: HttpStatus = HttpStatus.OK
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

/**
 * Create an error response
 */
export function createErrorResponse(
  type: ErrorType,
  message: string,
  status: HttpStatus,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      message,
      error: {
        type,
        details,
      },
    },
    { status }
  );
}

/**
 * Create a paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  message: string = 'Success'
): NextResponse<ApiResponse<T[]>> {
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return NextResponse.json({
    success: true,
    message,
    data,
    pagination: {
      ...pagination,
      totalPages,
    },
  });
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: any): NextResponse<ApiResponse> {
  console.error('API Error:', error);

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return createErrorResponse(
      ErrorType.VALIDATION_ERROR,
      'Validation failed',
      HttpStatus.UNPROCESSABLE_ENTITY,
      error.errors
    );
  }

  if (error.name === 'CastError') {
    return createErrorResponse(
      ErrorType.VALIDATION_ERROR,
      'Invalid ID format',
      HttpStatus.BAD_REQUEST
    );
  }

  if (error.code === 11000) {
    return createErrorResponse(
      ErrorType.CONFLICT,
      'Resource already exists',
      HttpStatus.CONFLICT,
      error.keyPattern
    );
  }

  // Database connection errors
  if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
    return createErrorResponse(
      ErrorType.DATABASE_ERROR,
      'Database connection failed',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  // Default error response
  return createErrorResponse(
    ErrorType.INTERNAL_SERVER_ERROR,
    'An unexpected error occurred',
    HttpStatus.INTERNAL_SERVER_ERROR
  );
}