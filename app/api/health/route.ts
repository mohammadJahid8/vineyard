import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import {
  createSuccessResponse,
  createErrorResponse,
  HttpStatus,
  ErrorType,
} from '@/lib/api-response';

/**
 * GET /api/health
 * Health check endpoint for the API and database
 */
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Test database connection
    await connectDB();
    
    const dbResponseTime = Date.now() - startTime;

    return createSuccessResponse(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          connected: true,
          responseTime: `${dbResponseTime}ms`,
        },
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
      },
      'Service is healthy'
    );
  } catch (error) {
    console.error('Health check failed:', error);
    
    return createErrorResponse(
      ErrorType.DATABASE_ERROR,
      'Database connection failed',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
