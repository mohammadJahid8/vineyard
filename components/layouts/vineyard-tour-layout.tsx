'use client';

import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { StepTabs } from '@/components/ui/step-tabs';
import { SimpleAccessGuard } from '@/components/simple-access-guard';

const tabs = [
  { id: 'vineyard', title: 'Vineyard', href: '/explore' },
  { id: 'lunch', title: 'Lunch', href: '/explore/lunch' },
  { id: 'trip', title: 'Trip', href: '/explore/trip' },
];

interface VineyardTourLayoutProps {
  children: React.ReactNode;
  currentStep: 'vineyard' | 'trip' | 'lunch';
  title?: string;
  subtitle?: string;
}

export default function VineyardTourLayout({
  children,
  currentStep,
  title,
  subtitle,
}: VineyardTourLayoutProps) {
  return (
    <SimpleAccessGuard>
      <div className=''>
        {/* Tab Navigation */}
        <StepTabs tabs={tabs} currentTab={currentStep} />

        {/* Content */}
        {children}

        {/* Bottom Navigation */}
        <div className='mt-32'>
          <BottomNavigation />
        </div>
      </div>
    </SimpleAccessGuard>
  );
}
