'use client';

import { useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import Image from 'next/image';
import { SmartImage } from '@/components/ui/smart-image';

interface ImageUploadSectionProps {
  title: string;
  description: string;
  type: 'vineyard' | 'restaurant';

  // Current image data
  currentImageUrl?: string;
  latitude?: number;
  longitude?: number;
  name?: string;

  // Preview state
  imagePreview: string | null;
  selectedImageFile: File | null;

  // Handlers
  onImageSelection: (file: File) => void;
  onClearImagePreview: () => void;
  onClearExistingImage: () => void;
  onImageUrlChange: (url: string) => void;
}

export function ImageUploadSection({
  title,
  description,
  type,
  currentImageUrl,
  latitude,
  longitude,
  name,
  imagePreview,
  selectedImageFile,
  onImageSelection,
  onClearImagePreview,
  onClearExistingImage,
  onImageUrlChange,
}: ImageUploadSectionProps) {
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onImageSelection(file);
      }
    },
    [onImageSelection]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Image Preview */}
        {(currentImageUrl || imagePreview) && (
          <div className='relative aspect-video w-full overflow-hidden rounded-lg border'>
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt={`New ${type} image preview`}
                fill
                className='object-cover'
              />
            ) : (
              <SmartImage
                imageUrl={currentImageUrl}
                latitude={latitude}
                longitude={longitude}
                name={name || title}
                type={type}
                alt={`${type} image`}
                fill
                className='object-cover'
                showFallbackText={false}
              />
            )}
            <Button
              type='button'
              variant='destructive'
              size='sm'
              className='absolute top-2 right-2'
              onClick={
                imagePreview ? onClearImagePreview : onClearExistingImage
              }
            >
              <X className='h-3 w-3' />
            </Button>
            {imagePreview && (
              <div className='absolute bottom-2 left-2'>
                <div className='bg-blue-600 text-white text-xs px-2 py-1 rounded'>
                  Ready to upload
                </div>
              </div>
            )}
          </div>
        )}

        {/* Show SmartImage preview when no image is set */}
        {!currentImageUrl && !imagePreview && name && (
          <div className='relative aspect-video w-full overflow-hidden rounded-lg border border-dashed border-gray-300'>
            <SmartImage
              latitude={latitude}
              longitude={longitude}
              name={name}
              type={type}
              alt={`${type} preview`}
              fill
              className='object-cover'
              subText='Auto-generated preview'
            />
            <div className='absolute bottom-2 left-2'>
              <div className='bg-green-600 text-white text-xs px-2 py-1 rounded'>
                Auto-generated preview
              </div>
            </div>
          </div>
        )}

        {/* File Upload */}
        <div className='space-y-2'>
          <Label htmlFor='image_upload'>Upload Image</Label>
          <Input
            id='image_upload'
            type='file'
            accept='image/*'
            onChange={handleFileChange}
          />
        </div>

        {/* Manual URL Input */}
        <div className='space-y-2'>
          <Label htmlFor='image_url'>Or enter image URL</Label>
          <Input
            id='image_url'
            type='url'
            value={currentImageUrl || ''}
            onChange={(e) => onImageUrlChange(e.target.value)}
            placeholder='https://example.com/image.jpg'
          />
        </div>
      </CardContent>
    </Card>
  );
}
