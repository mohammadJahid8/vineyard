'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { SmartImage } from '@/components/ui/smart-image';
import { Eye, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageViewerProps {
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  name?: string;
  alt: string;
  type: 'restaurant' | 'vineyard';
  className?: string;
  showFallbackText?: boolean;
  triggerClassName?: string;
  dialogClassName?: string;
}

export function ImageViewer({
  imageUrl,
  latitude,
  longitude,
  name,
  alt,
  type,
  className,
  showFallbackText = false,
  triggerClassName,
  dialogClassName,
}: ImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className={cn('group relative cursor-pointer', triggerClassName)}>
          <SmartImage
            imageUrl={imageUrl}
            latitude={latitude}
            longitude={longitude}
            name={name || alt}
            type={type}
            alt={alt}
            className={cn('object-cover', className)}
            fill
            showFallbackText={showFallbackText}
          />
          {/* Image viewer overlay */}
          <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
            <div className='flex items-center gap-2 text-white'>
              <Eye className='h-4 w-4' />
              <Maximize2 className='h-4 w-4' />
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent
        className={cn('max-w-4xl w-full h-[80vh] p-0', dialogClassName)}
      >
        <div className='relative w-full h-full rounded-lg overflow-hidden'>
          <SmartImage
            imageUrl={imageUrl}
            latitude={latitude}
            longitude={longitude}
            name={name || alt}
            type={type}
            alt={alt}
            className='object-contain w-full h-full'
            fill
            showFallbackText={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
