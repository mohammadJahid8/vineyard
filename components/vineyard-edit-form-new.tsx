'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  useVineyard,
  useCreateVineyard,
  useUpdateVineyard,
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
  const isCreating = vineyardId === 'new';

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

  // React Query hooks
  const { data: vineyard, isLoading, isError, error } = useVineyard(vineyardId);
  const createVineyardMutation = useCreateVineyard();
  const updateVineyardMutation = useUpdateVineyard();

  // Optimized form handling
  const {
    data: formData,
    updateField,
    setData,
  } = useOptimizedForm(
    emptyVineyard,
    (updatedData) => {
      // This callback is called with debounced data
    },
    50
  );

  // Sync form data when vineyard is loaded
  useEffect(() => {
    if (vineyard && !isLoading) {
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

  // Handle clearing existing image URL
  const handleClearExistingImage = useCallback(() => {
    handleInputChange('image_url', '');
  }, [handleInputChange]);

  // Extract coordinates from Google Maps URL
  const extractCoordinatesFromUrl = useCallback((url: string) => {
    if (!url) return { latitude: undefined, longitude: undefined };

    try {
      // Try to extract coordinates from various Google Maps URL formats
      const patterns = [
        /@(-?\d+\.?\d*),(-?\d+\.?\d*)/, // @lat,lng format
        /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/, // !3dlat!4dlng format
        /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/, // ll=lat,lng format
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
    } catch (error) {
      console.error('Error extracting coordinates:', error);
    }

    return { latitude: undefined, longitude: undefined };
  }, []);

  // Handle map link change with coordinate extraction
  const handleMapLinkChange = useCallback(
    (url: string) => {
      handleInputChange('maplink', url);

      if (url) {
        const { latitude, longitude } = extractCoordinatesFromUrl(url);
        if (latitude !== undefined && longitude !== undefined) {
          handleInputChange('latitude', latitude);
          handleInputChange('longitude', longitude);
          toast.success('Coordinates extracted from map link');
        }
      }
    },
    [handleInputChange, extractCoordinatesFromUrl]
  );

  // Check if form has changes
  const hasChanges =
    JSON.stringify(formData) !== JSON.stringify(vineyard || emptyVineyard) ||
    selectedImageFile !== null;

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
      if (!formData[field as keyof Vineyard]) {
        toast.error(`${field.replace('_', ' ')} is required`);
        return;
      }
    }

    try {
      let finalFormData = { ...formData };

      // Process image upload if there's a selected file
      const uploadedImageUrl = await processImageUpload();
      if (uploadedImageUrl) {
        finalFormData.image_url = uploadedImageUrl;
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
      cleanupPreview();

      router.push('/admin');
    } catch (error) {
      // Error is handled by the mutations
      console.error('Error saving vineyard:', error);
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
        router.push('/admin');
      }
    } else {
      router.push('/admin');
    }
  };

  const formContent = (
    <>
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
              onChange={(e) => handleInputChange('vineyard', e.target.value)}
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
                placeholder='Enter unique vineyard ID'
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='type'>Type *</Label>
              <Input
                id='type'
                value={formData?.type || ''}
                onChange={(e) => handleInputChange('type', e.target.value)}
                placeholder='e.g., Winery, Estate'
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
                onChange={(e) => handleInputChange('region', e.target.value)}
                placeholder='Enter region'
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
                placeholder='Enter sub region'
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
            Location details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='maplink'>Google Maps Link</Label>
            <Input
              id='maplink'
              type='url'
              value={formData?.maplink || ''}
              onChange={(e) => handleMapLinkChange(e.target.value)}
              placeholder='https://maps.google.com/...'
            />
            <p className='text-xs text-gray-500'>
              Coordinates will be automatically extracted from the map link
            </p>
          </div>

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
                    parseFloat(e.target.value) || undefined
                  )
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
                value={formData?.longitude || ''}
                onChange={(e) =>
                  handleInputChange(
                    'longitude',
                    parseFloat(e.target.value) || undefined
                  )
                }
                placeholder='e.g., -74.0060'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating & Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Rating & Pricing</CardTitle>
          <CardDescription>
            Rating information and pricing details
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='g'>Google Rating *</Label>
              <Input
                id='g'
                type='number'
                step='0.1'
                min='0'
                max='5'
                value={formData?.g || ''}
                onChange={(e) =>
                  handleInputChange('g', parseFloat(e.target.value) || 0)
                }
                placeholder='e.g., 4.5'
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='g_ratig_user'>Rating User Count *</Label>
              <Input
                id='g_ratig_user'
                value={formData?.g_ratig_user || ''}
                onChange={(e) =>
                  handleInputChange('g_ratig_user', e.target.value)
                }
                placeholder='e.g., 1,234 reviews'
                required
              />
            </div>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='lowest_cost_per_adult'>
                Lowest Cost per Adult *
              </Label>
              <Input
                id='lowest_cost_per_adult'
                type='number'
                step='0.01'
                min='0'
                value={formData?.lowest_cost_per_adult || ''}
                onChange={(e) =>
                  handleInputChange(
                    'lowest_cost_per_adult',
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder='e.g., 25.00'
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='highest_cost_per_adult'>
                Highest Cost per Adult *
              </Label>
              <Input
                id='highest_cost_per_adult'
                type='number'
                step='0.01'
                min='0'
                value={formData?.highest_cost_per_adult || ''}
                onChange={(e) =>
                  handleInputChange(
                    'highest_cost_per_adult',
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder='e.g., 75.00'
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
            Available experiences at the vineyard
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
              <Label htmlFor='tour_and_tasting'>Tour & Tasting</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Switch
                id='pairing_and_lunch'
                checked={formData?.pairing_and_lunch || false}
                onCheckedChange={(checked) =>
                  handleInputChange('pairing_and_lunch', checked)
                }
              />
              <Label htmlFor='pairing_and_lunch'>Pairing & Lunch</Label>
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
              <Label htmlFor='masterclass_workshop'>Masterclass Workshop</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reasons to Visit */}
      <Card>
        <CardHeader>
          <CardTitle>Reasons to Visit</CardTitle>
          <CardDescription>
            Key selling points and unique features
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className='space-y-2'>
              <Label htmlFor={`reason_${num}`}>Reason {num}</Label>
              <Textarea
                id={`reason_${num}`}
                value={
                  (formData?.[`reason_${num}` as keyof Vineyard] as string) ||
                  ''
                }
                onChange={(e) =>
                  handleInputChange(`reason_${num}`, e.target.value)
                }
                placeholder={`Enter reason ${num} to visit this vineyard`}
                rows={2}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );

  const sidebar = (
    <>
      <ImageUploadSection
        title='Vineyard Image'
        description='Upload an image for the vineyard'
        type='vineyard'
        currentImageUrl={formData?.image_url}
        latitude={formData?.latitude}
        longitude={formData?.longitude}
        name={formData?.vineyard}
        imagePreview={imagePreview}
        selectedImageFile={selectedImageFile}
        onImageSelection={handleImageSelection}
        onClearImagePreview={handleClearImagePreview}
        onClearExistingImage={handleClearExistingImage}
        onImageUrlChange={(url) => handleInputChange('image_url', url)}
      />

      <FormActions
        isNew={isCreating}
        entityType='vineyard'
        isCreating={createVineyardMutation.isPending}
        isUpdating={updateVineyardMutation.isPending}
        isUploading={isUploading}
        hasChanges={hasChanges}
        onCancel={handleBack}
      />
    </>
  );

  return (
    <EditFormLayout
      title={isCreating ? 'Add New Vineyard' : 'Edit Vineyard'}
      isLoading={isLoading && !isCreating}
      isError={isError}
      error={error}
      onBack={handleBack}
      onSubmit={handleSave}
      sidebar={sidebar}
    >
      {formContent}
    </EditFormLayout>
  );
}
