'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageIcon, Wine, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartImageProps {
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  name: string;
  type: 'vineyard' | 'restaurant';
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  showFallbackText?: boolean;
  subText?: string;
}

export function SmartImage({
  imageUrl,
  latitude,
  longitude,
  name,
  type,
  alt,
  className,
  fill = false,
  width,
  height,
  showFallbackText = true,
  subText,
}: SmartImageProps) {
  const [imageError, setImageError] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  // Check if we have a valid Cloudinary image URL
  const hasCloudinaryImage = imageUrl && imageUrl.trim() !== '' && !imageError;

  // Check if we can use thumbnail API
  const canUseThumbnail = latitude && longitude && name && !thumbnailError;

  // If we have Cloudinary image, use it
  if (hasCloudinaryImage) {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        className={className}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        onError={() => setImageError(true)}
      />
    );
  }

  // If we can use thumbnail API, use it
  if (canUseThumbnail) {
    return (
      <Image
        src={`/api/thumbnail?lat=${latitude}&lng=${longitude}&name=${encodeURIComponent(
          name
        )}&type=${type}`}
        alt={alt}
        className={className}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        onError={() => setThumbnailError(true)}
      />
    );
  }

  // Fallback to placeholder
  if (!showFallbackText) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-100',
          className
        )}
      >
        <ImageIcon className='h-4 w-4 text-gray-400' />
      </div>
    );
  }

  const bgColor =
    type === 'vineyard'
      ? 'bg-gradient-to-br from-vineyard-50 to-vineyard-100'
      : 'bg-gradient-to-br from-orange-50 to-orange-100';

  const textColor =
    type === 'vineyard' ? 'text-vineyard-600' : 'text-orange-600';

  const iconColor =
    type === 'vineyard' ? 'text-vineyard-400' : 'text-orange-400';

  const subTextColor =
    type === 'vineyard' ? 'text-vineyard-500' : 'text-orange-500';

  const Icon = type === 'vineyard' ? Wine : UtensilsCrossed;

  return (
    <div className={cn('flex items-center justify-center', bgColor, className)}>
      <div className='text-center p-2'>
        <Icon className={cn('h-8 w-8 mx-auto mb-1', iconColor)} />
        <p className={cn('text-xs font-medium leading-tight', textColor)}>
          {name}
        </p>
        {subText && (
          <p className={cn('text-xs leading-tight', subTextColor)}>{subText}</p>
        )}
      </div>
    </div>
  );
}

