'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useOptimizedForm } from '@/hooks/use-optimized-form';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { SimpleAccessGuard } from '@/components/simple-access-guard';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Save, ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import {
  useVineyard,
  useCreateVineyard,
  useUpdateVineyard,
  useUploadImage,
  type Vineyard,
} from '@/hooks/use-vineyard-queries';

const emptyVineyard: Partial<Vineyard> = {
  vineyard_id: '',
  vineyard: '',
  region: '',
  sub_region: '',
  type: '',
  g: 0,
  g_ratig_user: '',
  lowest_cost_per_adult: 0,
  highest_cost_per_adult: 0,
  reason_1: '',
  reason_2: '',
  reason_3: '',
  reason_4: '',
  reason_5: '',
  image_url: '',
  maplink: '',
  latitude: undefined,
  longitude: undefined,
  tasting_only: false,
  tour_and_tasting: false,
  pairing_and_lunch: false,
  vine_experience: false,
  masterclass_workshop: false,
};

interface VineyardEditFormProps {
  vineyardId: string;
}

export default function VineyardEditForm({
  vineyardId,
}: VineyardEditFormProps) {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const isCreating = vineyardId === 'new';

  // React Query hooks
  const { data: vineyard, isLoading, isError, error } = useVineyard(vineyardId);
  const createVineyardMutation = useCreateVineyard();
  const updateVineyardMutation = useUpdateVineyard();
  const uploadImageMutation = useUploadImage();

  // Optimized form handling
  const {
    data: formData,
    updateField,
    setData,
  } = useOptimizedForm(
    emptyVineyard, // Always start with empty data
    (updatedData) => {
      // This callback is called with debounced data
    },
    50
  );

  // Sync form data when vineyard is loaded
  useEffect(() => {
    if (vineyard && !isLoading) {
      console.log('Syncing vineyard data to form:', vineyard); // Debug log
      setData(vineyard);
    }
  }, [vineyard, isLoading, setData]);

  // Handle input change
  const handleInputChange = useCallback(
    (field: string, value: any) => {
      updateField(field as keyof Vineyard, value);
    },
    [updateField]
  );

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Handle clearing image preview
  const handleClearImagePreview = useCallback(() => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImageFile(null);
    setImagePreview(null);
  }, [imagePreview]);

  // Handle clearing existing image URL
  const handleClearExistingImage = useCallback(() => {
    handleInputChange('image_url', '');
  }, [handleInputChange]);

  // Extract coordinates from Google Maps URL
  const extractCoordinatesFromUrl = useCallback((url: string) => {
    if (!url) return { latitude: undefined, longitude: undefined };

    const patterns = [
      /@(-?\d+\.\d+),(-?\d+\.\d+)/,
      /ll=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return {
          latitude: parseFloat(match[1]),
          longitude: parseFloat(match[2]),
        };
      }
    }

    return { latitude: undefined, longitude: undefined };
  }, []);

  // Handle map link change and auto-extract coordinates
  const handleMapLinkChange = useCallback(
    (url: string) => {
      handleInputChange('maplink', url);

      if (url && !formData?.latitude && !formData?.longitude) {
        const { latitude, longitude } = extractCoordinatesFromUrl(url);
        if (latitude && longitude) {
          handleInputChange('latitude', latitude);
          handleInputChange('longitude', longitude);
          toast.success('Coordinates extracted from map link!');
        }
      }
    },
    [
      handleInputChange,
      extractCoordinatesFromUrl,
      formData?.latitude,
      formData?.longitude,
    ]
  );

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setSelectedImageFile(file);
      setImagePreview(previewUrl);
    }
  };

  // Handle image upload
  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setSelectedImageFile(file);
      setImagePreview(previewUrl);

      // Clear the input so the same file can be selected again
      event.target.value = '';
    },
    []
  );

  // Upload image function (now only called during save)
  const uploadImage = async (file: File): Promise<string> => {
    const result = await uploadImageMutation.mutateAsync(file);
    return result.imageUrl;
  };

  // Handle save
  const handleSave = async () => {
    if (!formData) return;

    // Validate required fields
    const requiredFields = [
      'vineyard_id',
      'vineyard',
      'region',
      'sub_region',
      'type',
      'g',
      'g_ratig_user',
      'lowest_cost_per_adult',
      'highest_cost_per_adult',
    ];

    for (const field of requiredFields) {
      if (
        !formData[field as keyof Vineyard] &&
        formData[field as keyof Vineyard] !== 0
      ) {
        toast.error(`${field.replace('_', ' ')} is required`);
        return;
      }
    }

    try {
      let finalFormData = { ...formData };

      // If there's a selected image file, upload it first
      if (selectedImageFile) {
        toast.info('Uploading image...');
        const imageUrl = await uploadImage(selectedImageFile);
        finalFormData.image_url = imageUrl;
        toast.success('Image uploaded successfully');
      }

      if (isCreating) {
        await createVineyardMutation.mutateAsync(finalFormData);
      } else {
        await updateVineyardMutation.mutateAsync({
          id: vineyardId,
          vineyard: finalFormData,
        });
      }

      // Clean up preview URL
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      router.push('/admin');
    } catch (error) {
      // Error is handled by the mutations
      console.error('Error saving vineyard:', error);
    }
  };

  // Handle error state
  if (isError) {
    return (
      <SimpleAccessGuard>
        <div className='min-h-screen bg-gradient-to-br from-vineyard-50 via-white to-vineyard-100 flex items-center justify-center pb-20'>
          <div className='text-center'>
            <p className='text-red-600 mb-4'>
              {error?.message || 'Failed to load vineyard'}
            </p>
            <Button onClick={() => router.push('/admin')}>Back to Admin</Button>
          </div>
        </div>
        <BottomNavigation />
      </SimpleAccessGuard>
    );
  }

  // Handle loading state
  if (isLoading && !isCreating) {
    return (
      <SimpleAccessGuard>
        <div className='min-h-screen bg-gradient-to-br from-vineyard-50 via-white to-vineyard-100 flex items-center justify-center pb-20'>
          <div className='text-center'>
            <Loader2 className='h-8 w-8 animate-spin text-vineyard-600 mx-auto mb-4' />
            <p className='text-vineyard-600'>Loading vineyard...</p>
          </div>
        </div>
        <BottomNavigation />
      </SimpleAccessGuard>
    );
  }

  return (
    <SimpleAccessGuard>
      <div className='min-h-screen bg-gradient-to-br from-vineyard-50 via-white to-vineyard-100 pb-20'>
        <div className='container mx-auto px-4 py-8 max-w-4xl'>
          {/* Header */}
          <div className='mb-8'>
            <div className='flex items-center gap-4 mb-4'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => router.push('/admin')}
                className='flex items-center gap-2'
              >
                <ArrowLeft className='h-4 w-4' />
                Back
              </Button>
            </div>
            <h1 className='text-3xl font-bold text-vineyard-800 mb-2'>
              {isCreating ? 'Create New Vineyard' : 'Edit Vineyard'}
            </h1>
            <p className='text-vineyard-600'>
              {isCreating
                ? 'Add a new vineyard to the system.'
                : 'Update vineyard information.'}
            </p>
          </div>

          {/* Form */}
          <div className='space-y-8'>
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Essential vineyard details and identification
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <Label htmlFor='vineyard_id'>Vineyard ID *</Label>
                    <Input
                      id='vineyard_id'
                      value={formData?.vineyard_id || ''}
                      onChange={(e) =>
                        handleInputChange('vineyard_id', e.target.value)
                      }
                      placeholder='e.g., VIN001'
                    />
                  </div>
                  <div>
                    <Label htmlFor='vineyard'>Vineyard Name *</Label>
                    <Input
                      id='vineyard'
                      value={formData?.vineyard || ''}
                      onChange={(e) =>
                        handleInputChange('vineyard', e.target.value)
                      }
                      placeholder='Vineyard name'
                    />
                  </div>
                  <div>
                    <Label htmlFor='region'>Region *</Label>
                    <Input
                      id='region'
                      value={formData?.region || ''}
                      onChange={(e) =>
                        handleInputChange('region', e.target.value)
                      }
                      placeholder='e.g., Napa Valley'
                    />
                  </div>
                  <div>
                    <Label htmlFor='sub_region'>Sub Region *</Label>
                    <Input
                      id='sub_region'
                      value={formData?.sub_region || ''}
                      onChange={(e) =>
                        handleInputChange('sub_region', e.target.value)
                      }
                      placeholder='e.g., Oakville'
                    />
                  </div>
                  <div>
                    <Label htmlFor='type'>Type *</Label>
                    <Input
                      id='type'
                      value={formData?.type || ''}
                      onChange={(e) =>
                        handleInputChange('type', e.target.value)
                      }
                      placeholder='e.g., Winery'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rating and Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Rating & Pricing</CardTitle>
                <CardDescription>
                  Rating information and cost details
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <Label htmlFor='g'>Rating (1-5) *</Label>
                    <Input
                      id='g'
                      type='number'
                      min='1'
                      max='5'
                      step='0.1'
                      value={formData?.g || ''}
                      onChange={(e) =>
                        handleInputChange('g', parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor='g_ratig_user'>Rating Source *</Label>
                    <Input
                      id='g_ratig_user'
                      value={formData?.g_ratig_user || ''}
                      onChange={(e) =>
                        handleInputChange('g_ratig_user', e.target.value)
                      }
                      placeholder='e.g., Google Reviews'
                    />
                  </div>
                  <div>
                    <Label htmlFor='lowest_cost_per_adult'>
                      Lowest Cost ($) *
                    </Label>
                    <Input
                      id='lowest_cost_per_adult'
                      type='number'
                      min='0'
                      value={formData?.lowest_cost_per_adult || ''}
                      onChange={(e) =>
                        handleInputChange(
                          'lowest_cost_per_adult',
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor='highest_cost_per_adult'>
                      Highest Cost ($) *
                    </Label>
                    <Input
                      id='highest_cost_per_adult'
                      type='number'
                      min='0'
                      value={formData?.highest_cost_per_adult || ''}
                      onChange={(e) =>
                        handleInputChange(
                          'highest_cost_per_adult',
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Experience Types */}
            <Card>
              <CardHeader>
                <CardTitle>Experience Types</CardTitle>
                <CardDescription>
                  Available experiences at this vineyard
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='flex items-center space-x-2'>
                    <Switch
                      id='tasting_only'
                      checked={formData?.tasting_only || false}
                      onCheckedChange={(checked) =>
                        handleInputChange('tasting_only', checked)
                      }
                    />
                    <Label htmlFor='tasting_only'>Tasting Only</Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Switch
                      id='tour_and_tasting'
                      checked={formData?.tour_and_tasting || false}
                      onCheckedChange={(checked) =>
                        handleInputChange('tour_and_tasting', checked)
                      }
                    />
                    <Label htmlFor='tour_and_tasting'>Tour and Tasting</Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Switch
                      id='pairing_and_lunch'
                      checked={formData?.pairing_and_lunch || false}
                      onCheckedChange={(checked) =>
                        handleInputChange('pairing_and_lunch', checked)
                      }
                    />
                    <Label htmlFor='pairing_and_lunch'>Pairing and Lunch</Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Switch
                      id='vine_experience'
                      checked={formData?.vine_experience || false}
                      onCheckedChange={(checked) =>
                        handleInputChange('vine_experience', checked)
                      }
                    />
                    <Label htmlFor='vine_experience'>Vine Experience</Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Switch
                      id='masterclass_workshop'
                      checked={formData?.masterclass_workshop || false}
                      onCheckedChange={(checked) =>
                        handleInputChange('masterclass_workshop', checked)
                      }
                    />
                    <Label htmlFor='masterclass_workshop'>
                      Masterclass Workshop
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Media and Location */}
            <Card>
              <CardHeader>
                <CardTitle>Media & Location</CardTitle>
                <CardDescription>Images, maps, and coordinates</CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Image Upload */}
                <div>
                  <Label htmlFor='image_url'>Image</Label>
                  <div className='space-y-4'>
                    {/* Image Preview Section */}
                    {(formData?.image_url || imagePreview) && (
                      <div className='space-y-2'>
                        <div className='text-sm text-gray-600'>
                          {imagePreview
                            ? 'New Image Preview:'
                            : 'Current Image:'}
                        </div>
                        <div className='relative w-full h-48 bg-gray-100 rounded-md overflow-hidden border'>
                          <Image
                            src={imagePreview || formData?.image_url || ''}
                            alt={
                              imagePreview
                                ? 'New vineyard image preview'
                                : 'Current vineyard image'
                            }
                            fill
                            className='object-cover'
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <div className='absolute top-2 right-2'>
                            <Button
                              type='button'
                              size='sm'
                              variant='destructive'
                              onClick={
                                imagePreview
                                  ? handleClearImagePreview
                                  : handleClearExistingImage
                              }
                              className='h-6 w-6 p-0'
                            >
                              <X className='h-3 w-3' />
                            </Button>
                          </div>
                          {imagePreview && (
                            <div className='absolute bottom-2 left-2'>
                              <div className='bg-blue-600 text-white text-xs px-2 py-1 rounded'>
                                Ready to upload
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Image Upload Options */}
                    <div className='space-y-4'>
                      <div className='text-sm text-gray-600'>
                        {formData?.image_url ? 'Replace with:' : 'Add image:'}
                      </div>

                      {/* File Upload */}
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                          dragActive
                            ? 'border-vineyard-500 bg-vineyard-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <div className='text-center'>
                          <div className='relative'>
                            <input
                              type='file'
                              accept='image/*'
                              onChange={handleImageUpload}
                              className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                              disabled={uploadImageMutation.isPending}
                            />
                            <div className='space-y-3'>
                              {uploadImageMutation.isPending ? (
                                <div className='flex items-center justify-center'>
                                  <Loader2 className='h-8 w-8 animate-spin text-vineyard-600' />
                                  <span className='ml-3 text-sm text-gray-600'>
                                    Uploading image...
                                  </span>
                                </div>
                              ) : (
                                <>
                                  <Upload
                                    className={`h-12 w-12 mx-auto ${
                                      dragActive
                                        ? 'text-vineyard-500'
                                        : 'text-gray-400'
                                    }`}
                                  />
                                  <div className='text-sm text-gray-600'>
                                    <span className='font-medium text-vineyard-600 hover:text-vineyard-700 cursor-pointer'>
                                      Click to upload
                                    </span>{' '}
                                    or drag and drop
                                  </div>
                                  <div className='text-xs text-gray-500'>
                                    PNG, JPG, WebP up to 10MB
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* URL Input */}
                      <div className='space-y-2'>
                        <div className='text-sm text-gray-600'>
                          Or enter image URL:
                        </div>
                        <Input
                          id='image_url'
                          value={formData?.image_url || ''}
                          onChange={(e) =>
                            handleInputChange('image_url', e.target.value)
                          }
                          placeholder='https://example.com/image.jpg'
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Map Link */}
                <div>
                  <Label htmlFor='maplink'>Map Link</Label>
                  <Input
                    id='maplink'
                    value={formData?.maplink || ''}
                    onChange={(e) => handleMapLinkChange(e.target.value)}
                    placeholder='https://maps.google.com/... (coordinates will be auto-extracted)'
                  />
                  <p className='text-xs text-gray-500 mt-1'>
                    Paste a Google Maps link to automatically extract
                    coordinates
                  </p>
                </div>

                {/* Coordinates */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <Label htmlFor='latitude'>Latitude</Label>
                    <Input
                      id='latitude'
                      type='number'
                      step='any'
                      value={formData?.latitude || ''}
                      onChange={(e) =>
                        handleInputChange(
                          'latitude',
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined
                        )
                      }
                      placeholder='e.g., 38.2975'
                    />
                  </div>
                  <div>
                    <Label htmlFor='longitude'>Longitude</Label>
                    <Input
                      id='longitude'
                      type='number'
                      step='any'
                      value={formData?.longitude || ''}
                      onChange={(e) =>
                        handleInputChange(
                          'longitude',
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined
                        )
                      }
                      placeholder='e.g., -122.4194'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reasons to Visit */}
            <Card>
              <CardHeader>
                <CardTitle>Reasons to Visit</CardTitle>
                <CardDescription>
                  Highlight what makes this vineyard special
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {[1, 2, 3, 4, 5].map((num) => (
                  <div key={num}>
                    <Label htmlFor={`reason_${num}`}>Reason {num}</Label>
                    <Textarea
                      id={`reason_${num}`}
                      value={
                        (formData[
                          `reason_${num}` as keyof Vineyard
                        ] as string) || ''
                      }
                      onChange={(e) =>
                        handleInputChange(`reason_${num}`, e.target.value)
                      }
                      placeholder={`Reason ${num} to visit this vineyard`}
                      rows={3}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className='flex justify-end space-x-4'>
              <Button
                variant='outline'
                onClick={() => router.push('/admin')}
                disabled={
                  createVineyardMutation.isPending ||
                  updateVineyardMutation.isPending ||
                  uploadImageMutation.isPending
                }
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  createVineyardMutation.isPending ||
                  updateVineyardMutation.isPending ||
                  uploadImageMutation.isPending
                }
                className='bg-vineyard-600 hover:bg-vineyard-700'
              >
                {createVineyardMutation.isPending ||
                updateVineyardMutation.isPending ||
                uploadImageMutation.isPending ? (
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                ) : (
                  <Save className='h-4 w-4 mr-2' />
                )}
                {uploadImageMutation.isPending
                  ? 'Uploading Image...'
                  : createVineyardMutation.isPending ||
                    updateVineyardMutation.isPending
                  ? 'Saving...'
                  : isCreating
                  ? 'Create Vineyard'
                  : 'Update Vineyard'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </SimpleAccessGuard>
  );
}
