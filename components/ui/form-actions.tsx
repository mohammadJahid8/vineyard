'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';

interface FormActionsProps {
  isNew: boolean;
  entityType: 'vineyard' | 'restaurant';

  // Loading states
  isCreating: boolean;
  isUpdating: boolean;
  isUploading: boolean;

  // Form state
  hasChanges: boolean;

  // Handlers
  onCancel: () => void;
}

export function FormActions({
  isNew,
  entityType,
  isCreating,
  isUpdating,
  isUploading,
  hasChanges,
  onCancel,
}: FormActionsProps) {
  const isLoading = isCreating || isUpdating || isUploading;
  const entityName = entityType.charAt(0).toUpperCase() + entityType.slice(1);

  const getLoadingText = () => {
    if (isUploading) return 'Uploading image...';
    if (isCreating) return 'Creating...';
    if (isUpdating) return 'Updating...';
    return '';
  };

  const getButtonText = () => {
    return isNew ? `Create ${entityName}` : `Update ${entityName}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <Button
          type='submit'
          className='w-full bg-vineyard-500 hover:bg-vineyard-600'
          disabled={isLoading || !hasChanges}
        >
          {isLoading ? (
            <>
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              {getLoadingText()}
            </>
          ) : (
            <>
              <Save className='h-4 w-4 mr-2' />
              {getButtonText()}
            </>
          )}
        </Button>

        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
          className='w-full'
          disabled={isLoading}
        >
          Cancel
        </Button>
      </CardContent>
    </Card>
  );
}
