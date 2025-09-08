'use client';

import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserMenu } from '@/components/ui/user-menu';
import {
  Grape,
  FileText,
  Utensils,
  Clock,
  Star,
  MapPin,
  Edit3,
  Share2,
  Download,
  Plus,
  Calendar,
} from 'lucide-react';
import { useTrip } from '@/lib/context/trip-context';
import Link from 'next/link';

export default function ItineraryPage() {
  const { trip } = useTrip();
  const hasCurrentTrip = trip.vineyard || trip.restaurant;

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
                <p className='text-sm text-gray-600'>Your saved plans</p>
              </div>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto space-y-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-3xl font-bold text-gray-900'>Your Plans</h2>
            {hasCurrentTrip && (
              <Link href='/explore/day-trip'>
                <Button className='bg-vineyard-500 hover:bg-vineyard-600'>
                  <Edit3 className='h-4 w-4 mr-2' />
                  Edit Current Plan
                </Button>
              </Link>
            )}
          </div>

          {/* Current Trip Plan */}
          {hasCurrentTrip ? (
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <div className='p-2 bg-vineyard-100 rounded-full'>
                      <Calendar className='h-5 w-5 text-vineyard-600' />
                    </div>
                    <div>
                      <CardTitle className='text-xl'>
                        Current Day Trip Plan
                      </CardTitle>
                      <p className='text-sm text-gray-600'>
                        Created {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant='secondary'>Draft</Badge>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Plan Overview */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {/* Vineyard Summary */}
                  {trip.vineyard && (
                    <div className='border rounded-lg p-4 bg-gradient-to-br from-vineyard-50 to-white'>
                      <div className='flex items-center space-x-3 mb-3'>
                        <div className='p-2 bg-vineyard-100 rounded-full'>
                          <Grape className='h-4 w-4 text-vineyard-600' />
                        </div>
                        <div>
                          <h4 className='font-semibold'>
                            {trip.vineyard.vineyard.vineyard}
                          </h4>
                          <p className='text-sm text-gray-600'>
                            {trip.vineyard.offer?.experience || 'Heritage Tour'}
                          </p>
                        </div>
                      </div>
                      <div className='space-y-2 text-sm'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center space-x-2'>
                            <Clock className='h-3 w-3 text-gray-400' />
                            <span>Time</span>
                          </div>
                          <span className='font-medium'>
                            {trip.vineyard.time || '11:00'}
                          </span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center space-x-2'>
                            <Star className='h-3 w-3 text-yellow-400' />
                            <span>Rating</span>
                          </div>
                          <span className='font-medium'>
                            {trip.vineyard.vineyard.g}
                          </span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center space-x-2'>
                            <MapPin className='h-3 w-3 text-gray-400' />
                            <span>Location</span>
                          </div>
                          <span className='font-medium'>
                            {trip.vineyard.vineyard.sub_region}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Restaurant Summary */}
                  {trip.restaurant && (
                    <div className='border rounded-lg p-4 bg-gradient-to-br from-orange-50 to-white'>
                      <div className='flex items-center space-x-3 mb-3'>
                        <div className='p-2 bg-orange-100 rounded-full'>
                          <Utensils className='h-4 w-4 text-orange-600' />
                        </div>
                        <div>
                          <h4 className='font-semibold'>
                            {trip.restaurant.restaurant.restaurants}
                          </h4>
                          <p className='text-sm text-gray-600'>Bistro Lunch</p>
                        </div>
                      </div>
                      <div className='space-y-2 text-sm'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center space-x-2'>
                            <Clock className='h-3 w-3 text-gray-400' />
                            <span>Time</span>
                          </div>
                          <span className='font-medium'>
                            {trip.restaurant.time || '13:00'}
                          </span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center space-x-2'>
                            <Star className='h-3 w-3 text-yellow-400' />
                            <span>Rating</span>
                          </div>
                          <span className='font-medium'>
                            {trip.restaurant.restaurant.g_rating}
                          </span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center space-x-2'>
                            <MapPin className='h-3 w-3 text-gray-400' />
                            <span>Location</span>
                          </div>
                          <span className='font-medium'>
                            {trip.restaurant.restaurant.sub_region}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <Separator />
                <div className='flex flex-wrap gap-3'>
                  <Link href='/explore/day-trip'>
                    <Button variant='outline' size='sm'>
                      <Edit3 className='h-4 w-4 mr-2' />
                      Edit Plan
                    </Button>
                  </Link>
                  <Button variant='outline' size='sm'>
                    <Share2 className='h-4 w-4 mr-2' />
                    Share
                  </Button>
                  <Button variant='outline' size='sm'>
                    <Download className='h-4 w-4 mr-2' />
                    Export PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Empty State */
            <Card>
              <CardContent className='text-center py-12'>
                <div className='mx-auto mb-4 p-3 bg-vineyard-100 rounded-full w-fit'>
                  <FileText className='h-8 w-8 text-vineyard-600' />
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  No Plans Yet
                </h3>
                <p className='text-gray-600 mb-6'>
                  Start planning your perfect vineyard tour experience.
                </p>
                <Link href='/explore'>
                  <Button className='bg-vineyard-500 hover:bg-vineyard-600'>
                    <Plus className='h-4 w-4 mr-2' />
                    Create Your First Plan
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
