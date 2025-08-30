'use client';

import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserButton, UserProfile } from '@clerk/nextjs';
import { Grape, User } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-vineyard-50 via-white to-vineyard-100 pb-20'>
      {/* Header */}
      <header className='border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center space-x-3'>
              <Grape className='h-8 w-8 text-vineyard-500' />
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>
                  Vineyard Tour Planner
                </h1>
                <p className='text-sm text-gray-600'>Your profile settings</p>
              </div>
            </div>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10',
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className='container mx-auto px-4 py-8'>
        <UserProfile />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
