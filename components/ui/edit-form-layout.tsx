'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { SimpleAccessGuard } from '@/components/simple-access-guard';
import { BottomNavigation } from '@/components/ui/bottom-navigation';

interface EditFormLayoutProps {
  title: string;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
  sidebar: ReactNode;
}

export function EditFormLayout({
  title,
  isLoading = false,
  isError = false,
  error = null,
  onBack,
  onSubmit,
  children,
  sidebar,
}: EditFormLayoutProps) {
  // Loading state
  if (isLoading) {
    return (
      <SimpleAccessGuard>
        <div className='min-h-screen bg-gradient-to-br from-vineyard-50 via-white to-vineyard-100 pb-20'>
          <div className='container mx-auto px-4 py-8'>
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-vineyard-600 mx-auto mb-4'></div>
                <p className='text-vineyard-600'>Loading...</p>
              </div>
            </div>
          </div>
        </div>
        <BottomNavigation />
      </SimpleAccessGuard>
    );
  }

  // Error state
  if (isError) {
    return (
      <SimpleAccessGuard>
        <div className='min-h-screen bg-gradient-to-br from-vineyard-50 via-white to-vineyard-100 pb-20'>
          <div className='container mx-auto px-4 py-8'>
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <p className='text-red-600 mb-4'>
                  {error?.message || 'Failed to load data'}
                </p>
                <Button onClick={onBack} variant='outline'>
                  Go Back
                </Button>
              </div>
            </div>
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
            <Button variant='ghost' onClick={onBack} className='p-2'>
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <div>
              <h1 className='text-3xl font-bold text-vineyard-800'>{title}</h1>
            </div>
          </div>

          <form onSubmit={onSubmit}>
            <div className='grid gap-6 lg:grid-cols-3'>
              {/* Main Form */}
              <div className='lg:col-span-2 space-y-6'>{children}</div>

              {/* Sidebar */}
              <div className='space-y-6'>{sidebar}</div>
            </div>
          </form>
        </div>
      </div>
      <BottomNavigation />
    </SimpleAccessGuard>
  );
}
