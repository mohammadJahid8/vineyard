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
import { toast } from 'sonner';
import { Save, ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { SmartImage } from '@/components/ui/smart-image';
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

  // Handle image upload
  const handleImageUpload = useCallback(async (file: File) => {
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

  // Upload image function (now only called during save)
  const uploadImage = async (file: File): Promise<string> => {
    const result = await uploadImageMutation.mutateAsync(file);
    return result.imageUrl;
  };

  // Handle save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

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
        toast.success('Vineyard created successfully');
      } else {
        await updateVineyardMutation.mutateAsync({
          id: vineyardId,
          vineyard: finalFormData,
        });
        toast.success('Vineyard updated successfully');
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
        <div className='container mx-auto px-4 py-8'>
          {/* Header */}
          <div className='flex items-center gap-4 mb-6'>
            <Button
              variant='ghost'
              onClick={() => router.push('/admin')}
              className='p-2'
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <div>
              <h1 className='text-3xl font-bold text-vineyard-800'>
                {isCreating ? 'Add New Vineyard' : 'Edit Vineyard'}
              </h1>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className='grid gap-6 lg:grid-cols-3'>
              {/* Main Form */}
              <div className='lg:col-span-2 space-y-6'>
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Essential vineyard details and identification
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='vineyard'>Vineyard Name *</Label>
                      <Input
                        id='vineyard'
                        value={formData?.vineyard || ''}
                        onChange={(e) =>
                          handleInputChange('vineyard', e.target.value)
                        }
                        placeholder='Enter vineyard name'
                        required
                      />
                    </div>

                    <div className='grid gap-4 sm:grid-cols-2'>
                      <div className='space-y-2'>
                        <Label htmlFor='vineyard_id'>Vineyard ID *</Label>
                        <Input
                          id='vineyard_id'
                          value={formData?.vineyard_id || ''}
                          onChange={(e) =>
                            handleInputChange('vineyard_id', e.target.value)
                          }
                          placeholder='e.g., VIN001'
                          required
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='type'>Type *</Label>
                        <Input
                          id='type'
                          value={formData?.type || ''}
                          onChange={(e) =>
                            handleInputChange('type', e.target.value)
                          }
                          placeholder='e.g., Winery'
                          required
                        />
                      </div>
                    </div>

                    <div className='grid gap-4 sm:grid-cols-2'>
                      <div className='space-y-2'>
                        <Label htmlFor='region'>Region *</Label>
                        <Input
                          id='region'
                          value={formData?.region || ''}
                          onChange={(e) =>
                            handleInputChange('region', e.target.value)
                          }
                          placeholder='e.g., Napa Valley'
                          required
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='sub_region'>Sub Region *</Label>
                        <Input
                          id='sub_region'
                          value={formData?.sub_region || ''}
                          onChange={(e) =>
                            handleInputChange('sub_region', e.target.value)
                          }
                          placeholder='e.g., Oakville'
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Location & Contact */}
                <Card>
                  <CardHeader>
                    <CardTitle>Location & Contact</CardTitle>
                    <CardDescription>
                      Geographic and map information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='grid gap-4 sm:grid-cols-2'>
                      <div className='space-y-2'>
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
                      <div className='space-y-2'>
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

                    <div className='space-y-2'>
                      <Label htmlFor='maplink'>Map Link</Label>
                      <Input
                        id='maplink'
                        value={formData?.maplink || ''}
                        onChange={(e) => handleMapLinkChange(e.target.value)}
                        placeholder='https://maps.google.com/... (coordinates will be auto-extracted)'
                      />
                      <p className='text-xs text-gray-500'>
                        Paste a Google Maps link to automatically extract
                        coordinates
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Rating & Pricing */}
                <Card>
                  <CardHeader>
                    <CardTitle>Rating & Pricing</CardTitle>
                    <CardDescription>
                      Rating information and cost details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='grid gap-4 sm:grid-cols-2'>
                      <div className='space-y-2'>
                        <Label htmlFor='g'>Rating (1-5) *</Label>
                        <Input
                          id='g'
                          type='number'
                          min='1'
                          max='5'
                          step='0.1'
                          value={formData?.g || ''}
                          onChange={(e) =>
                            handleInputChange(
                              'g',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          required
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='g_ratig_user'>Rating Source *</Label>
                        <Input
                          id='g_ratig_user'
                          value={formData?.g_ratig_user || ''}
                          onChange={(e) =>
                            handleInputChange('g_ratig_user', e.target.value)
                          }
                          placeholder='e.g., Google Reviews'
                          required
                        />
                      </div>
                    </div>

                    <div className='grid gap-4 sm:grid-cols-2'>
                      <div className='space-y-2'>
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
                          required
                        />
                      </div>
                      <div className='space-y-2'>
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
                          required
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
                  <CardContent className='space-y-4'>
                    <div className='grid gap-4 sm:grid-cols-2'>
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
                        <Label htmlFor='tour_and_tasting'>
                          Tour and Tasting
                        </Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Switch
                          id='pairing_and_lunch'
                          checked={formData?.pairing_and_lunch || false}
                          onCheckedChange={(checked) =>
                            handleInputChange('pairing_and_lunch', checked)
                          }
                        />
                        <Label htmlFor='pairing_and_lunch'>
                          Pairing and Lunch
                        </Label>
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

                {/* Reasons to Visit */}
                <Card>
                  <CardHeader>
                    <CardTitle>Reasons to Visit</CardTitle>
                    <CardDescription>
                      Highlight what makes this vineyard special
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div key={num} className='space-y-2'>
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
              </div>

              {/* Sidebar */}
              <div className='space-y-6'>
                {/* Image Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle>Vineyard Image</CardTitle>
                    <CardDescription>
                      Upload an image for the vineyard
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {(formData?.image_url || imagePreview) && (
                      <div className='relative aspect-video w-full overflow-hidden rounded-lg border'>
                        {imagePreview ? (
                          <Image
                            src={imagePreview}
                            alt='New vineyard image preview'
                            fill
                            className='object-cover'
                          />
                        ) : (
                          <SmartImage
                            imageUrl={formData?.image_url}
                            latitude={formData?.latitude}
                            longitude={formData?.longitude}
                            name={formData?.vineyard || 'Vineyard'}
                            type='vineyard'
                            alt='Vineyard image'
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
                            imagePreview
                              ? handleClearImagePreview
                              : handleClearExistingImage
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
                    {!formData?.image_url &&
                      !imagePreview &&
                      formData?.vineyard && (
                        <div className='relative aspect-video w-full overflow-hidden rounded-lg border border-dashed border-gray-300'>
                          <SmartImage
                            latitude={formData?.latitude}
                            longitude={formData?.longitude}
                            name={formData?.vineyard}
                            type='vineyard'
                            alt='Vineyard preview'
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

                    <div className='space-y-2'>
                      <Label htmlFor='image_upload'>Upload Image</Label>
                      <div className='flex items-center gap-2'>
                        <Input
                          id='image_upload'
                          type='file'
                          accept='image/*'
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(file);
                            }
                          }}
                          disabled={uploadImageMutation.isPending}
                        />
                        {uploadImageMutation.isPending && (
                          <Loader2 className='h-4 w-4 animate-spin text-vineyard-600' />
                        )}
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='image_url'>Or enter image URL</Label>
                      <Input
                        id='image_url'
                        type='url'
                        value={formData?.image_url || ''}
                        onChange={(e) =>
                          handleInputChange('image_url', e.target.value)
                        }
                        placeholder='Enter image URL'
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <Button
                      type='submit'
                      className='w-full bg-vineyard-500 hover:bg-vineyard-600'
                      disabled={
                        createVineyardMutation.isPending ||
                        updateVineyardMutation.isPending ||
                        uploadImageMutation.isPending
                      }
                    >
                      {createVineyardMutation.isPending ||
                      updateVineyardMutation.isPending ||
                      uploadImageMutation.isPending ? (
                        <>
                          <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                          {uploadImageMutation.isPending
                            ? 'Uploading Image...'
                            : isCreating
                            ? 'Creating...'
                            : 'Updating...'}
                        </>
                      ) : (
                        <>
                          <Save className='h-4 w-4 mr-2' />
                          {isCreating ? 'Create Vineyard' : 'Update Vineyard'}
                        </>
                      )}
                    </Button>

                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => router.push('/admin')}
                      className='w-full'
                    >
                      Cancel
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>

      <BottomNavigation />
    </SimpleAccessGuard>
  );
}
