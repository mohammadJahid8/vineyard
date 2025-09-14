'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { useTrip } from '@/lib/context/trip-context';

interface Tab {
  id: string;
  title: string;
  href: string;
}

interface StepTabsProps {
  tabs: Tab[];
  currentTab: string;
}

export function StepTabs({ tabs, currentTab }: StepTabsProps) {
  const { trip, isStateSynced } = useTrip();

  const getTabStatus = (tabId: string) => {
    // First tab (vineyard) is always accessible
    if (tabId === 'vineyard') return 'accessible';

    // Other tabs require vineyard selection
    if (trip.vineyards.length === 0) return 'locked';

    // Plan tab is accessible once vineyards are selected (no sync requirement)
    return 'accessible';
  };

  return (
    <div className='border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40'>
      <div className='container mx-auto px-4'>
        <nav className='flex justify-center space-x-8' aria-label='Tabs'>
          {tabs.map((tab) => {
            const status = getTabStatus(tab.id);
            const isLocked = status === 'locked';
            const isCurrent = tab.id === currentTab;

            const TabContent = (
              <div
                className={cn(
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200',
                  {
                    'border-vineyard-500 text-vineyard-600':
                      isCurrent && !isLocked,
                    'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300':
                      !isCurrent && !isLocked,
                    'border-transparent text-gray-400 cursor-not-allowed':
                      isLocked,
                  }
                )}
              >
                {isLocked && <Lock className='w-4 h-4' />}
                {tab.title}
              </div>
            );

            return (
              <div key={tab.id}>
                {isLocked ? (
                  <div className='cursor-not-allowed'>{TabContent}</div>
                ) : (
                  <Link href={tab.href}>{TabContent}</Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Tab Validation Messages */}
      {/* {currentTab === 'lunch' && trip.vineyards.length === 0 && (
        <div className='container mx-auto px-4 pb-3'>
          <div className='text-center text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3'>
            Please select at least one vineyard first to access the lunch tab.
          </div>
        </div>
      )}

      {currentTab === 'plan' && trip.vineyards.length === 0 && (
        <div className='container mx-auto px-4 pb-3'>
          <div className='text-center text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3'>
            Please select at least one vineyard first to access the plan tab.
          </div>
        </div>
      )} */}
    </div>
  );
}
