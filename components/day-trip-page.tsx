'use client';

import { useState } from 'react';
import { Stepper } from '@/components/ui/stepper';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { UserButton } from '@clerk/nextjs';
import {
  Grape,
  Utensils,
  Clock,
  Star,
  X,
  Plus,
  Mail,
  Download,
  Share2,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { useTrip } from '@/lib/context/trip-context';
import Link from 'next/link';

const steps = [
  { id: 'vineyard', title: 'Vineyard', href: '/explore' },
  { id: 'lunch', title: 'Lunch', href: '/explore/lunch' },
  { id: 'daytrip', title: 'Day Trip', href: '/explore/day-trip' },
];

export default function DayTripPage() {
  const {
    trip,
    removeVineyard,
    removeRestaurant,
    updateVineyardTime,
    updateRestaurantTime,
  } = useTrip();
  const [vineyardTime, setVineyardTime] = useState(
    trip.vineyard?.time || '11:00'
  );
  const [restaurantTime, setRestaurantTime] = useState(
    trip.restaurant?.time || '13:00'
  );

  const handleVineyardTimeChange = (time: string) => {
    setVineyardTime(time);
    updateVineyardTime(time);
  };

  const handleRestaurantTimeChange = (time: string) => {
    setRestaurantTime(time);
    updateRestaurantTime(time);
  };

  const hasItems = trip.vineyard || trip.restaurant;

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
                <p className='text-sm text-gray-600'>
                  Plan your perfect wine tour experience
                </p>
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

      {/* Stepper */}
      <Stepper steps={steps} currentStep='daytrip' />

      {/* Content */}
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto'>
          <Card>
            <CardHeader className='text-center'>
              <CardTitle className='text-3xl'>Confirm Your Itinerary</CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Vineyard Visit */}
              {trip.vineyard ? (
                <div className='border rounded-lg p-4 bg-white'>
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex items-center space-x-3'>
                      <div className='p-2 bg-vineyard-100 rounded-full'>
                        <Grape className='h-5 w-5 text-vineyard-600' />
                      </div>
                      <div>
                        <h3 className='font-semibold text-lg'>
                          {trip.vineyard.vineyard.vineyard}
                        </h3>
                        <p className='text-sm text-gray-600'>
                          {trip.vineyard.offer?.experience || 'Heritage Tour'}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-blue-600 hover:text-blue-700'
                      >
                        Change Time
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={removeVineyard}
                        className='text-red-600 hover:text-red-700'
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                    <div className='flex items-center space-x-2'>
                      <Clock className='h-4 w-4 text-gray-400' />
                      <div>
                        <Label
                          htmlFor='vineyard-time'
                          className='text-sm font-medium'
                        >
                          Time
                        </Label>
                        <Input
                          id='vineyard-time'
                          type='time'
                          value={vineyardTime}
                          onChange={(e) =>
                            handleVineyardTimeChange(e.target.value)
                          }
                          className='mt-1'
                        />
                      </div>
                    </div>

                    <div className='flex items-center space-x-2'>
                      <Star className='h-4 w-4 text-yellow-400' />
                      <div>
                        <p className='text-sm font-medium'>Google Rating</p>
                        <p className='text-sm text-gray-600'>
                          {trip.vineyard.vineyard.g} (
                          {trip.vineyard.vineyard.g_ratig_user})
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center space-x-2'>
                      <MapPin className='h-4 w-4 text-gray-400' />
                      <div>
                        <p className='text-sm font-medium'>Location</p>
                        <p className='text-sm text-gray-600'>
                          {trip.vineyard.vineyard.sub_region}
                        </p>
                      </div>
                    </div>
                  </div>

                  {trip.vineyard.offer && (
                    <div className='bg-vineyard-50 rounded-lg p-3'>
                      <div className='flex justify-between items-center'>
                        <div>
                          <p className='font-medium'>
                            {trip.vineyard.offer.title}
                          </p>
                          <p className='text-sm text-gray-600'>
                            {trip.vineyard.offer.duration}
                          </p>
                        </div>
                        <Badge variant='secondary'>
                          €{trip.vineyard.offer.cost_per_adult}/person
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                  <Grape className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    No Vineyard Selected
                  </h3>
                  <p className='text-gray-600 mb-4'>
                    Choose a vineyard to start planning your trip
                  </p>
                  <Link href='/explore'>
                    <Button className='bg-vineyard-500 hover:bg-vineyard-600'>
                      <Plus className='h-4 w-4 mr-2' />
                      Add Vineyard
                    </Button>
                  </Link>
                </div>
              )}

              {/* Restaurant/Lunch */}
              {trip.restaurant ? (
                <div className='border rounded-lg p-4 bg-white'>
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex items-center space-x-3'>
                      <div className='p-2 bg-orange-100 rounded-full'>
                        <Utensils className='h-5 w-5 text-orange-600' />
                      </div>
                      <div>
                        <h3 className='font-semibold text-lg'>
                          {trip.restaurant.restaurant.restaurants}
                        </h3>
                        <p className='text-sm text-gray-600'>Bistro Lunch</p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-blue-600 hover:text-blue-700'
                      >
                        Change Time
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={removeRestaurant}
                        className='text-red-600 hover:text-red-700'
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                    <div className='flex items-center space-x-2'>
                      <Clock className='h-4 w-4 text-gray-400' />
                      <div>
                        <Label
                          htmlFor='restaurant-time'
                          className='text-sm font-medium'
                        >
                          Time
                        </Label>
                        <Input
                          id='restaurant-time'
                          type='time'
                          value={restaurantTime}
                          onChange={(e) =>
                            handleRestaurantTimeChange(e.target.value)
                          }
                          className='mt-1'
                        />
                      </div>
                    </div>

                    <div className='flex items-center space-x-2'>
                      <Star className='h-4 w-4 text-yellow-400' />
                      <div>
                        <p className='text-sm font-medium'>Google Rating</p>
                        <p className='text-sm text-gray-600'>
                          {trip.restaurant.restaurant.g_rating}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center space-x-2'>
                      <MapPin className='h-4 w-4 text-gray-400' />
                      <div>
                        <p className='text-sm font-medium'>Location</p>
                        <p className='text-sm text-gray-600'>
                          {trip.restaurant.restaurant.sub_region}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='bg-orange-50 rounded-lg p-3'>
                    <div className='flex justify-between items-center'>
                      <div>
                        <p className='font-medium'>
                          {trip.restaurant.restaurant.actual_type}
                        </p>
                        <p className='text-sm text-gray-600'>
                          {trip.restaurant.restaurant.open_days}
                        </p>
                      </div>
                      <Badge variant='secondary'>
                        €{trip.restaurant.restaurant.avg_est_lunch_cost}/person
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                  <Utensils className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    No Restaurant Selected
                  </h3>
                  <p className='text-gray-600 mb-4'>
                    Add a lunch stop to complete your day trip
                  </p>
                  <Link href='/explore/lunch'>
                    <Button variant='outline'>
                      <Plus className='h-4 w-4 mr-2' />
                      Add Lunch Nearby
                    </Button>
                  </Link>
                </div>
              )}

              {/* Quick Actions */}
              {!trip.vineyard && !trip.restaurant && (
                <div className='text-center space-y-4'>
                  <Separator />
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <Link href='/explore'>
                      <Button variant='outline' className='w-full'>
                        <Plus className='h-4 w-4 mr-2' />
                        Add Another Visit
                      </Button>
                    </Link>
                    <Link href='/explore/lunch'>
                      <Button variant='outline' className='w-full'>
                        <Plus className='h-4 w-4 mr-2' />
                        Add Lunch Nearby
                      </Button>
                    </Link>
                  </div>
                  <Link href='/map'>
                    <Button variant='outline' className='w-full'>
                      <MapPin className='h-4 w-4 mr-2' />
                      Map View
                    </Button>
                  </Link>
                </div>
              )}

              {/* Export Options */}
              {hasItems && (
                <>
                  <Separator />
                  <div className='text-center space-y-4'>
                    <h3 className='text-lg font-semibold'>
                      Export Your Itinerary
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <Button className='bg-blue-600 hover:bg-blue-700'>
                        <Mail className='h-4 w-4 mr-2' />
                        Email PDF
                      </Button>
                      <Button className='bg-vineyard-500 hover:bg-vineyard-600'>
                        <Download className='h-4 w-4 mr-2' />
                        Download PDF
                      </Button>
                    </div>
                    <Button variant='outline' className='w-full md:w-auto'>
                      <Share2 className='h-4 w-4 mr-2' />
                      Share Itinerary
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
