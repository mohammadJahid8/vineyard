'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { toast } from 'sonner';
import { Save, ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { SmartImage } from '@/components/ui/smart-image';
import {
  useRestaurant,
  useCreateRestaurant,
  useUpdateRestaurant,
} from '@/hooks/use-restaurant-queries';
import { useUploadImage } from '@/hooks/use-vineyard-queries';
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

  // State for image upload
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

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
  const uploadImageMutation = useUploadImage();

  // Optimized form handling
  const {
    data: formData,
    updateField,
    setData,
  } = useOptimizedForm(
    emptyRestaurant, // Always start with empty data
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
    JSON.stringify(restaurant || emptyRestaurant);

  // Sync form data when restaurant is loaded
  useEffect(() => {
    if (restaurant && !isLoadingRestaurant) {
      console.log('Syncing restaurant data to form:', restaurant); // Debug log
      setData(restaurant);
    }
  }, [restaurant, isLoadingRestaurant, setData]);

  // Update uploaded image URL in form when it changes
  useEffect(() => {
    if (uploadedImageUrl) {
      updateField('image_url', uploadedImageUrl);
    }
  }, [uploadedImageUrl, updateField]);

  // Handle image upload
  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!file) return;

      try {
        setIsUploading(true);
        const result = await uploadImageMutation.mutateAsync(file);
        setUploadedImageUrl(result.imageUrl);
        toast.success('Image uploaded successfully');
      } catch (error) {
        console.error('Error uploading image:', error);
        // Error toast is handled by the mutation
      } finally {
        setIsUploading(false);
      }
    },
    [uploadImageMutation]
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!safeFormData.restaurants?.trim()) {
      toast.error('Restaurant name is required');
      return;
    }

    try {
      if (isNew) {
        await createRestaurantMutation.mutateAsync(formData);
        toast.success('Restaurant created successfully');
        router.push(`/admin?tab=${tab}`);
      } else {
        await updateRestaurantMutation.mutateAsync({
          id: restaurantId,
          restaurant: formData,
        });
        toast.success('Restaurant updated successfully');
        router.push(`/admin?tab=${tab}`);
      }
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

  // Loading state
  if (isLoadingRestaurant && !isNew) {
    return (
      <SimpleAccessGuard>
        <div className='min-h-screen bg-gradient-to-br from-vineyard-50 via-white to-vineyard-100 pb-20'>
          <div className='container mx-auto px-4 py-8'>
            <Card className='max-w-md mx-auto'>
              <CardContent className='pt-6'>
                <div className='flex items-center justify-center py-12'>
                  <Loader2 className='h-8 w-8 animate-spin text-vineyard-600' />
                  <span className='ml-3 text-vineyard-600'>
                    Loading restaurant...
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <BottomNavigation />
      </SimpleAccessGuard>
    );
  }

  // Error state
  if (isRestaurantError && !isNew) {
    return (
      <SimpleAccessGuard>
        <div className='min-h-screen bg-gradient-to-br from-vineyard-50 via-white to-vineyard-100 pb-20'>
          <div className='container mx-auto px-4 py-8'>
            <Card className='max-w-md mx-auto'>
              <CardHeader>
                <CardTitle className='text-red-600'>Error</CardTitle>
                <CardDescription>
                  {restaurantError?.message || 'Failed to load restaurant'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleBack} className='w-full'>
                  Go Back
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <BottomNavigation />
      </SimpleAccessGuard>
    );
  }

  // Safety check - ensure we have valid form data
  if (!safeFormData) {
    return (
      <SimpleAccessGuard>
        <div className='min-h-screen bg-gradient-to-br from-vineyard-50 via-white to-vineyard-100 pb-20'>
          <div className='container mx-auto px-4 py-8'>
            <Card className='max-w-md mx-auto'>
              <CardContent className='pt-6'>
                <div className='flex items-center justify-center py-12'>
                  <Loader2 className='h-8 w-8 animate-spin text-vineyard-600' />
                  <span className='ml-3 text-vineyard-600'>
                    Initializing form...
                  </span>
                </div>
              </CardContent>
            </Card>
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
            <Button variant='ghost' onClick={handleBack} className='p-2'>
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <div>
              <h1 className='text-3xl font-bold text-vineyard-800'>
                {isNew ? 'Add New Restaurant' : 'Edit Restaurant'}
              </h1>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className='grid gap-6 lg:grid-cols-3'>
              {/* Main Form */}
              <div className='lg:col-span-2 space-y-6'>
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
                        onChange={(e) =>
                          updateField('restaurants', e.target.value)
                        }
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
                          onChange={(e) =>
                            updateField('region', e.target.value)
                          }
                          placeholder='Enter region'
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='sub_region'>Sub Region</Label>
                        <Input
                          id='sub_region'
                          value={safeFormData.sub_region || ''}
                          onChange={(e) =>
                            updateField('sub_region', e.target.value)
                          }
                          placeholder='Enter sub region'
                        />
                      </div>
                    </div>

                    <div className='grid gap-4 sm:grid-cols-2'>
                      <div className='space-y-2'>
                        <Label htmlFor='actual_type'>Actual Type</Label>
                        <Input
                          id='actual_type'
                          value={safeFormData.actual_type || ''}
                          onChange={(e) =>
                            updateField('actual_type', e.target.value)
                          }
                          placeholder='Enter actual type'
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
                          placeholder='Enter Google type'
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
                      Geographic and contact information
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
                          value={safeFormData.latitude || ''}
                          onChange={(e) =>
                            updateField(
                              'latitude',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder='Enter latitude'
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
                            updateField(
                              'longitude',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder='Enter longitude'
                        />
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='gkp_link'>Google Maps Link</Label>
                      <Input
                        id='gkp_link'
                        type='url'
                        value={safeFormData.gkp_link || ''}
                        onChange={(e) =>
                          updateField('gkp_link', e.target.value)
                        }
                        placeholder='Enter Google Maps link'
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='ta_link'>TripAdvisor Link</Label>
                      <Input
                        id='ta_link'
                        type='url'
                        value={safeFormData.ta_link || ''}
                        onChange={(e) => updateField('ta_link', e.target.value)}
                        placeholder='Enter TripAdvisor link'
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Ratings & Pricing */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ratings & Pricing</CardTitle>
                    <CardDescription>
                      Rating and cost information
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
                            updateField(
                              'g_rating',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder='Enter Google rating (0-5)'
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
                            updateField(
                              'ta_rating',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder='Enter TripAdvisor rating (0-5)'
                        />
                      </div>
                    </div>

                    <div className='grid gap-4 sm:grid-cols-2'>
                      <div className='space-y-2'>
                        <Label htmlFor='avg_est_lunch_cost'>
                          Average Lunch Cost (€)
                        </Label>
                        <Input
                          id='avg_est_lunch_cost'
                          type='number'
                          min='0'
                          value={safeFormData.avg_est_lunch_cost || ''}
                          onChange={(e) =>
                            updateField(
                              'avg_est_lunch_cost',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder='Enter average lunch cost'
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='avg_dinner_cost'>
                          Average Dinner Cost (€)
                        </Label>
                        <Input
                          id='avg_dinner_cost'
                          type='number'
                          min='0'
                          value={safeFormData.avg_dinner_cost || ''}
                          onChange={(e) =>
                            updateField(
                              'avg_dinner_cost',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder='Enter average dinner cost'
                        />
                      </div>
                    </div>

                    <div className='grid gap-4 sm:grid-cols-2'>
                      <div className='space-y-2'>
                        <Label htmlFor='bracket'>Lunch Bracket</Label>
                        <Input
                          id='bracket'
                          value={safeFormData.bracket || ''}
                          onChange={(e) =>
                            updateField('bracket', e.target.value)
                          }
                          placeholder='Enter lunch bracket (A, B, C)'
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='bracket_1'>Dinner Bracket</Label>
                        <Input
                          id='bracket_1'
                          value={safeFormData.bracket_1 || ''}
                          onChange={(e) =>
                            updateField('bracket_1', e.target.value)
                          }
                          placeholder='Enter dinner bracket (A, B, C)'
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Operating Hours */}
                <Card>
                  <CardHeader>
                    <CardTitle>Operating Hours</CardTitle>
                    <CardDescription>
                      Restaurant operating schedule
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='open_days'>Open Days (Lunch)</Label>
                      <Input
                        id='open_days'
                        value={safeFormData.open_days || ''}
                        onChange={(e) =>
                          updateField('open_days', e.target.value)
                        }
                        placeholder='e.g., Mon-Fri, Weekends, Daily'
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='open_days_1'>Open Days (Dinner)</Label>
                      <Input
                        id='open_days_1'
                        value={safeFormData.open_days_1 || ''}
                        onChange={(e) =>
                          updateField('open_days_1', e.target.value)
                        }
                        placeholder='e.g., Mon-Fri, Weekends, Daily'
                      />
                    </div>

                    <div className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        id='dinner_tf'
                        checked={safeFormData.dinner_tf || false}
                        onChange={(e) =>
                          updateField('dinner_tf', e.target.checked)
                        }
                        className='rounded border-gray-300'
                      />
                      <Label htmlFor='dinner_tf'>Serves Dinner</Label>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className='space-y-6'>
                {/* Image Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle>Restaurant Image</CardTitle>
                    <CardDescription>
                      Upload an image for the restaurant
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {(safeFormData.image_url || uploadedImageUrl) && (
                      <div className='relative aspect-video w-full overflow-hidden rounded-lg border'>
                        {uploadedImageUrl ? (
                          <Image
                            src={uploadedImageUrl}
                            alt='Uploaded restaurant image'
                            fill
                            className='object-cover'
                          />
                        ) : (
                          <SmartImage
                            imageUrl={safeFormData.image_url}
                            latitude={safeFormData.latitude}
                            longitude={safeFormData.longitude}
                            name={safeFormData.restaurants || 'Restaurant'}
                            type='restaurant'
                            alt='Restaurant image'
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
                          onClick={() => {
                            setUploadedImageUrl('');
                            updateField('image_url', '');
                          }}
                        >
                          <X className='h-3 w-3' />
                        </Button>
                        {uploadedImageUrl && (
                          <div className='absolute bottom-2 left-2'>
                            <div className='bg-blue-600 text-white text-xs px-2 py-1 rounded'>
                              Uploaded image
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Show SmartImage preview when no image is set */}
                    {!safeFormData.image_url &&
                      !uploadedImageUrl &&
                      safeFormData.restaurants && (
                        <div className='relative aspect-video w-full overflow-hidden rounded-lg border border-dashed border-gray-300'>
                          <SmartImage
                            latitude={safeFormData.latitude}
                            longitude={safeFormData.longitude}
                            name={safeFormData.restaurants}
                            type='restaurant'
                            alt='Restaurant preview'
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
                          disabled={isUploading}
                        />
                        {isUploading && (
                          <Loader2 className='h-4 w-4 animate-spin text-vineyard-600' />
                        )}
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='image_url'>Or enter image URL</Label>
                      <Input
                        id='image_url'
                        type='url'
                        value={safeFormData.image_url || ''}
                        onChange={(e) =>
                          updateField('image_url', e.target.value)
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
                        createRestaurantMutation.isPending ||
                        updateRestaurantMutation.isPending ||
                        !hasChanges
                      }
                    >
                      {createRestaurantMutation.isPending ||
                      updateRestaurantMutation.isPending ? (
                        <>
                          <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                          {isNew ? 'Creating...' : 'Updating...'}
                        </>
                      ) : (
                        <>
                          <Save className='h-4 w-4 mr-2' />
                          {isNew ? 'Create Restaurant' : 'Update Restaurant'}
                        </>
                      )}
                    </Button>

                    <Button
                      type='button'
                      variant='outline'
                      onClick={handleBack}
                      className='w-full'
                    >
                      Cancel
                    </Button>

                    {hasChanges && (
                      <p className='text-xs text-amber-600 text-center'>
                        You have unsaved changes
                      </p>
                    )}
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
