'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useUploadImage } from '@/hooks/use-vineyard-queries';

export function useImageUpload() {
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const uploadImageMutation = useUploadImage();

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Handle image selection (create preview, don't upload yet)
  const handleImageSelection = useCallback((file: File) => {
    if (!file) return;

    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setSelectedImageFile(file);
      setImagePreview(previewUrl);
      toast.success('Image selected for upload');
    } catch (error) {
      console.error('Error selecting image:', error);
      toast.error('Failed to select image');
    }
  }, []);

  // Handle clearing image preview
  const handleClearImagePreview = useCallback(() => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImageFile(null);
    setImagePreview(null);
  }, [imagePreview]);

  // Upload image function (called during save)
  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const result = await uploadImageMutation.mutateAsync(file);
    return result.imageUrl;
  }, [uploadImageMutation]);

  // Process image upload during form submission
  const processImageUpload = useCallback(async (): Promise<string | null> => {
    if (!selectedImageFile) return null;

    toast.info('Uploading image...');
    const imageUrl = await uploadImage(selectedImageFile);
    toast.success('Image uploaded successfully');
    return imageUrl;
  }, [selectedImageFile, uploadImage]);

  // Clean up preview URL
  const cleanupPreview = useCallback(() => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
  }, [imagePreview]);

  return {
    selectedImageFile,
    imagePreview,
    isUploading: uploadImageMutation.isPending,
    handleImageSelection,
    handleClearImagePreview,
    processImageUpload,
    cleanupPreview,
  };
}
