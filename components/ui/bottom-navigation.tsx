'use client';

import { useTrip } from '@/lib/context/trip-context';
import { cn } from '@/lib/utils';
import { Home, Search, Grid3X3, FileText, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigationItems = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    href: '/',
  },
  {
    id: 'explore',
    label: 'Explore',
    icon: Search,
    href: '/explore',
  },
  {
    id: 'plans',
    label: 'Plans',
    icon: Grid3X3,
    href: '/plans',
  },
  {
    id: 'plan',
    label: 'Plan',
    icon: FileText,
    href: '/explore/plan',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    href: '/profile',
  },
];

export function BottomNavigation() {
  const pathname = usePathname();

  const { trip } = useTrip();

  // Check if there are any vineyards in the plan
  const hasPlan = trip.vineyards.length > 0;

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb'>
      <div className='grid grid-cols-5 h-16'>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const isDisabled = item.id === 'plan' && !hasPlan;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center space-y-1 text-xs transition-colors',
                {
                  'text-vineyard-600': active && !isDisabled,
                  'text-gray-400 hover:text-gray-600': !active && !isDisabled,
                  'text-gray-300 cursor-not-allowed pointer-events-none':
                    isDisabled,
                }
              )}
            >
              <Icon
                className={cn('h-5 w-5', {
                  'text-vineyard-600': active,
                  'text-gray-400': !active,
                  'text-gray-300 pointer-events-none': isDisabled,
                })}
              />
              <span className='font-medium'>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
