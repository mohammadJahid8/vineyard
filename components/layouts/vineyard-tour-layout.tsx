'use client';

import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { UserMenu } from '@/components/ui/user-menu';
import { Stepper } from '@/components/ui/stepper';
import { Grape } from 'lucide-react';

const steps = [
  { id: 'vineyard', title: 'Vineyard', href: '/explore' },
  { id: 'lunch', title: 'Lunch', href: '/explore/lunch' },
  { id: 'review', title: 'Review', href: '/explore/review' },
  { id: 'plan', title: 'Plan', href: '/explore/plan' },
];

interface VineyardTourLayoutProps {
  children: React.ReactNode;
  currentStep: 'vineyard' | 'plan' | 'lunch' | 'review';
  title?: string;
  subtitle?: string;
}

export default function VineyardTourLayout({
  children,
  currentStep,
  title = 'Vineyard Tour Planner',
  subtitle = 'Plan your perfect wine tour experience',
}: VineyardTourLayoutProps) {
  return (
    <div className='min-h-screen bg-gradient-to-br from-vineyard-50 via-white to-vineyard-100 pb-20'>
      {/* Header */}
      <header className='border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center space-x-3'>
              <Grape className='h-8 w-8 text-vineyard-500' />
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>{title}</h1>
                <p className='text-sm text-gray-600'>{subtitle}</p>
              </div>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Stepper */}
      <Stepper steps={steps} currentStep={currentStep} />

      {/* Content */}
      {children}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
