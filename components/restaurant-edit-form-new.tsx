'use client';

import { useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOptimizedForm } from '@/hooks/use-optimized-form';
import { useImageUpload } from '@/hooks/use-image-upload';
import { EditFormLayout } from '@/components/ui/edit-form-layout';
import { ImageUploadSection } from '@/components/ui/image-upload-section';
import { FormActions } from '@/components/ui/form-actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  useRestaurant,
  useCreateRestaurant,
  useUpdateRestaurant,
} from '@/hooks/use-restaurant-queries';
import { Restaurant } from '@/lib/types-vineyard';

const emptyRestaurant: Partial<Restaurant> = {
  region: '',
  sub_region: '',
  actual_type: '',
  approx_google_type: '',
  restaurants: '',
  gkp_link: '',
  g_rating: 0,
  open_days: '',
  bracket: '',
  avg_est_lunch_cost: 0,
  ta_link: '',
  ta_rating: 0,
  dinner_tf: false,
  open_days_1: '',
  bracket_1: '',
  avg_dinner_cost: 0,
  latitude: 0,
  longitude: 0,
  image_url: '',
};

interface RestaurantEditFormProps {
  restaurantId: string;
}

export function RestaurantEditForm({ restaurantId }: RestaurantEditFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNew = restaurantId === 'new';

  // Get the tab parameter to navigate back correctly
  const tab = searchParams.get('tab') || 'restaurants';

  // Image upload functionality
  const {
    selectedImageFile,
    imagePreview,
    isUploading,
    handleImageSelection,
    handleClearImagePreview,
    processImageUpload,
    cleanupPreview,
  } = useImageUpload();

  // Fetch restaurant data if editing
  const {
    data: restaurant,
    isLoading: isLoadingRestaurant,
    isError: isRestaurantError,
    error: restaurantError,
  } = useRestaurant(restaurantId);

  // Mutations
  const createRestaurantMutation = useCreateRestaurant();
  const updateRestaurantMutation = useUpdateRestaurant();

  // Optimized form handling
  const {
    data: formData,
    updateField,
    setData,
  } = useOptimizedForm(
    emptyRestaurant,
    (updatedData) => {
      // This callback is called with debounced data
    },
    50
  );

  // Ensure formData is never undefined
  const safeFormData = formData || emptyRestaurant;

  // Check if form has changes
  const hasChanges =
    JSON.stringify(safeFormData) !==
      JSON.stringify(restaurant || emptyRestaurant) ||
    selectedImageFile !== null;

  // Sync form data when restaurant is loaded
  useEffect(() => {
    if (restaurant && !isLoadingRestaurant) {
      setData(restaurant);
    }
  }, [restaurant, isLoadingRestaurant, setData]);

  // Handle clearing existing image URL
  const handleClearExistingImage = useCallback(() => {
    updateField('image_url', '');
  }, [updateField]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!safeFormData.restaurants?.trim()) {
      toast.error('Restaurant name is required');
      return;
    }

    try {
      let finalFormData = { ...formData };

      // Process image upload if there's a selected file
      const uploadedImageUrl = await processImageUpload();
      if (uploadedImageUrl) {
        finalFormData.image_url = uploadedImageUrl;
      }

      if (isNew) {
        await createRestaurantMutation.mutateAsync(finalFormData);
        toast.success('Restaurant created successfully');
      } else {
        await updateRestaurantMutation.mutateAsync({
          id: restaurantId,
          restaurant: finalFormData,
        });
        toast.success('Restaurant updated successfully');
      }

      // Clean up preview URL
      cleanupPreview();

      router.push(`/admin?tab=${tab}`);
    } catch (error) {
      console.error('Error saving restaurant:', error);
      // Error toast is handled by the mutations
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (hasChanges) {
      if (
        window.confirm(
          'You have unsaved changes. Are you sure you want to leave?'
        )
      ) {
        router.push(`/admin?tab=${tab}`);
      }
    } else {
      router.push(`/admin?tab=${tab}`);
    }
  };

  const formContent = (
    <>
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Essential details about the restaurant
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='restaurants'>Restaurant Name *</Label>
            <Input
              id='restaurants'
              value={safeFormData.restaurants || ''}
              onChange={(e) => updateField('restaurants', e.target.value)}
              placeholder='Enter restaurant name'
              required
            />
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='region'>Region</Label>
              <Input
                id='region'
                value={safeFormData.region || ''}
                onChange={(e) => updateField('region', e.target.value)}
                placeholder='Enter region'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='sub_region'>Sub Region</Label>
              <Input
                id='sub_region'
                value={safeFormData.sub_region || ''}
                onChange={(e) => updateField('sub_region', e.target.value)}
                placeholder='Enter sub region'
              />
            </div>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='actual_type'>Restaurant Type</Label>
              <Input
                id='actual_type'
                value={safeFormData.actual_type || ''}
                onChange={(e) => updateField('actual_type', e.target.value)}
                placeholder='e.g., Fine Dining, Casual'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='approx_google_type'>Google Type</Label>
              <Input
                id='approx_google_type'
                value={safeFormData.approx_google_type || ''}
                onChange={(e) =>
                  updateField('approx_google_type', e.target.value)
                }
                placeholder='Google category'
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
            Location details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='gkp_link'>Google Maps Link</Label>
            <Input
              id='gkp_link'
              type='url'
              value={safeFormData.gkp_link || ''}
              onChange={(e) => updateField('gkp_link', e.target.value)}
              placeholder='https://maps.google.com/...'
            />
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='latitude'>Latitude</Label>
              <Input
                id='latitude'
                type='number'
                step='any'
                value={safeFormData.latitude || ''}
                onChange={(e) =>
                  updateField('latitude', parseFloat(e.target.value) || 0)
                }
                placeholder='e.g., 40.7128'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='longitude'>Longitude</Label>
              <Input
                id='longitude'
                type='number'
                step='any'
                value={safeFormData.longitude || ''}
                onChange={(e) =>
                  updateField('longitude', parseFloat(e.target.value) || 0)
                }
                placeholder='e.g., -74.0060'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ratings & Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Ratings & Reviews</CardTitle>
          <CardDescription>
            Rating information from various platforms
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='g_rating'>Google Rating</Label>
              <Input
                id='g_rating'
                type='number'
                step='0.1'
                min='0'
                max='5'
                value={safeFormData.g_rating || ''}
                onChange={(e) =>
                  updateField('g_rating', parseFloat(e.target.value) || 0)
                }
                placeholder='e.g., 4.5'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='ta_rating'>TripAdvisor Rating</Label>
              <Input
                id='ta_rating'
                type='number'
                step='0.1'
                min='0'
                max='5'
                value={safeFormData.ta_rating || ''}
                onChange={(e) =>
                  updateField('ta_rating', parseFloat(e.target.value) || 0)
                }
                placeholder='e.g., 4.2'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='ta_link'>TripAdvisor Link</Label>
            <Input
              id='ta_link'
              type='url'
              value={safeFormData.ta_link || ''}
              onChange={(e) => updateField('ta_link', e.target.value)}
              placeholder='https://tripadvisor.com/...'
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing & Hours</CardTitle>
          <CardDescription>
            Operating hours and pricing information
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='open_days'>Open Days</Label>
              <Input
                id='open_days'
                value={safeFormData.open_days || ''}
                onChange={(e) => updateField('open_days', e.target.value)}
                placeholder='e.g., Mon-Sun'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='bracket'>Price Bracket</Label>
              <Input
                id='bracket'
                value={safeFormData.bracket || ''}
                onChange={(e) => updateField('bracket', e.target.value)}
                placeholder='e.g., $$, $$$'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='avg_est_lunch_cost'>Average Lunch Cost (€)</Label>
            <Input
              id='avg_est_lunch_cost'
              type='number'
              step='0.01'
              min='0'
              value={safeFormData.avg_est_lunch_cost || ''}
              onChange={(e) =>
                updateField(
                  'avg_est_lunch_cost',
                  parseFloat(e.target.value) || 0
                )
              }
              placeholder='e.g., 25.00'
            />
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='open_days_1'>Dinner Days</Label>
              <Input
                id='open_days_1'
                value={safeFormData.open_days_1 || ''}
                onChange={(e) => updateField('open_days_1', e.target.value)}
                placeholder='e.g., Fri-Sat'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='avg_dinner_cost'>Average Dinner Cost (€)</Label>
              <Input
                id='avg_dinner_cost'
                type='number'
                step='0.01'
                min='0'
                value={safeFormData.avg_dinner_cost || ''}
                onChange={(e) =>
                  updateField(
                    'avg_dinner_cost',
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder='e.g., 45.00'
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );

  const sidebar = (
    <>
      <ImageUploadSection
        title='Restaurant Image'
        description='Upload an image for the restaurant'
        type='restaurant'
        currentImageUrl={safeFormData.image_url}
        latitude={safeFormData.latitude}
        longitude={safeFormData.longitude}
        name={safeFormData.restaurants}
        imagePreview={imagePreview}
        selectedImageFile={selectedImageFile}
        onImageSelection={handleImageSelection}
        onClearImagePreview={handleClearImagePreview}
        onClearExistingImage={handleClearExistingImage}
        onImageUrlChange={(url) => updateField('image_url', url)}
      />

      <FormActions
        isNew={isNew}
        entityType='restaurant'
        isCreating={createRestaurantMutation.isPending}
        isUpdating={updateRestaurantMutation.isPending}
        isUploading={isUploading}
        hasChanges={hasChanges}
        onCancel={handleBack}
      />
    </>
  );

  return (
    <EditFormLayout
      title={isNew ? 'Add New Restaurant' : 'Edit Restaurant'}
      isLoading={isLoadingRestaurant && !isNew}
      isError={isRestaurantError}
      error={restaurantError}
      onBack={handleBack}
      onSubmit={handleSubmit}
      sidebar={sidebar}
    >
      {formContent}
    </EditFormLayout>
  );
}
