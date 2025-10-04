import { NextRequest } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
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
import connectDB from '@/lib/mongodb';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return createErrorResponse(
        ErrorType.VALIDATION_ERROR,
        'No file uploaded',
        HttpStatus.BAD_REQUEST
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return createErrorResponse(
        ErrorType.VALIDATION_ERROR,
        'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
        HttpStatus.BAD_REQUEST
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return createErrorResponse(
        ErrorType.VALIDATION_ERROR,
        'File size too large. Maximum size is 10MB.',
        HttpStatus.BAD_REQUEST
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'vineyard-images',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' },
            { format: 'auto' }
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    const result = uploadResult as any;

    return createSuccessResponse(
      {
        imageUrl: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
      },
      'Image uploaded successfully',
      HttpStatus.CREATED
    );
  } catch (error) {
    console.error('Image upload error:', error);
    return handleApiError(error);
  }
}
