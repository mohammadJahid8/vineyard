# Cloudinary Environment Variables Setup

To enable image uploads with Cloudinary, add the following environment variables to your `.env.local` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dordkfpi1
CLOUDINARY_API_KEY=854971448572153
CLOUDINARY_API_SECRET=TwOJ5xiANJbe2eQBpqPntM3xrfw
```

## Features:

- Automatic image optimization and compression
- Multiple format support (JPEG, PNG, WebP)
- Automatic format conversion for better performance
- Image resizing to 800x600 maximum dimensions
- 10MB file size limit
- Secure cloud storage with CDN delivery

The admin dashboard will automatically use these credentials for image uploads.
