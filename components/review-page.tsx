'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { NavigationWarning } from '@/components/ui/navigation-warning';
import VineyardTourLayout from '@/components/layouts/vineyard-tour-layout';
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
  Trash2,
  Loader2,
} from 'lucide-react';
import { useTrip } from '@/lib/context/trip-context';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ReviewPage() {
  const {
    trip,
    removeVineyard,
    removeRestaurant,
    updateVineyardTime,
    updateRestaurantTime,
    loadPlan,
    savePlan,
    hasUnsavedChanges,
  } = useTrip();
  const { data: session } = useSession();
  const router = useRouter();
  const [restaurantTime, setRestaurantTime] = useState(
    trip.restaurant?.time || '13:00'
  );
  const [showVineyardTimeInputs, setShowVineyardTimeInputs] = useState<{
    [key: string]: boolean;
  }>({});
  const [showRestaurantTimeInput, setShowRestaurantTimeInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      if (session?.user?.id) {
        try {
          // Check for active plan to get plan ID
          const response = await fetch('/api/plans?type=active');
          const data = await response.json();

          if (data.success && data.data.plan) {
            setPlanId(data.data.plan.id);
          }

          // Load plan data if we don't have it locally
          if (trip.vineyards.length === 0 && !trip.restaurant) {
            await loadPlan();
          }
        } catch (error) {
          console.error('Failed to load plan data:', error);
        }
      }
      setLoading(false);
    };

    loadData();
  }, [session?.user?.id, loadPlan]);

  const handleVineyardTimeChange = (vineyardId: string, time: string) => {
    updateVineyardTime(vineyardId, time);
  };

  const handleRestaurantTimeChange = (time: string) => {
    setRestaurantTime(time);
    updateRestaurantTime(time);
  };

  const toggleVineyardTimeInput = (vineyardId: string) => {
    setShowVineyardTimeInputs((prev) => ({
      ...prev,
      [vineyardId]: !prev[vineyardId],
    }));
  };

  const toggleRestaurantTimeInput = () => {
    setShowRestaurantTimeInput((prev) => !prev);
  };

  const handleConfirmPlan = async () => {
    if (!session?.user?.id) {
      console.error('Missing session');
      return;
    }

    try {
      setConfirming(true);

      // First save the current plan to database
      await savePlan();

      // Get the draft plan ID after saving (in case it was just created)
      const planResponse = await fetch('/api/plans?type=active');
      const planData = await planResponse.json();

      if (
        !planData.success ||
        !planData.data.plan
        // planData.data.plan.status !== 'draft'
      ) {
        throw new Error('Failed to get plan ID');
      }

      const currentPlanId = planData.data.plan.id;

      // Then confirm the plan
      const confirmResponse = await fetch(
        `/api/plans/${currentPlanId}/confirm`,
        {
          method: 'POST',
        }
      );

      const confirmData = await confirmResponse.json();

      if (confirmData.success) {
        // Redirect to plan page to show confirmed plan
        router.push('/explore/plan');
      } else {
        console.error('Failed to confirm plan:', confirmData.message);
        // Could add error state here if needed
      }
    } catch (error) {
      console.error('Error confirming plan:', error);
    } finally {
      setConfirming(false);
    }
  };

  const hasItems = trip.vineyards.length > 0 || trip.restaurant;

  if (loading) {
    return (
      <VineyardTourLayout
        currentStep='review'
        title='Loading Your Itinerary'
        subtitle='Please wait while we load your saved plan'
      >
        <div className='container mx-auto px-4 py-8'>
          <div className='max-w-4xl mx-auto'>
            <Card>
              <CardContent className='flex flex-col items-center justify-center py-12'>
                <Loader2 className='h-8 w-8 animate-spin text-vineyard-500 mb-4' />
                <h3 className='text-lg font-semibold mb-2'>Loading...</h3>
                <p className='text-gray-600 text-center'>
                  We're retrieving your saved itinerary.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </VineyardTourLayout>
    );
  }

  return (
    <VineyardTourLayout
      currentStep='review'
      title='Review Your Itinerary'
      subtitle='Review and customize your vineyard tour before confirming'
    >
      <NavigationWarning />
      {/* Content */}
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto'>
          <Card>
            <CardHeader className='text-center'>
              <CardTitle className='text-3xl'>Review Your Itinerary</CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Unsaved Changes Warning */}
              {hasUnsavedChanges && (
                <div className='p-3 rounded-lg border bg-amber-50 border-amber-200 text-amber-700'>
                  <div className='flex items-center space-x-2'>
                    <Clock className='h-4 w-4' />
                    <span className='text-sm font-medium'>
                      ⚠️ You have unsaved changes. Click "Confirm Plan" to save
                      your selections.
                    </span>
                  </div>
                </div>
              )}
              {/* Vineyard Visits */}
              {trip.vineyards.length > 0 ? (
                <div className='space-y-4'>
                  {trip.vineyards.map((tripVineyard, index) => (
                    <div
                      key={tripVineyard.vineyard.vineyard_id}
                      className='border rounded-lg p-4 bg-white'
                    >
                      <div className='flex items-start justify-between mb-4'>
                        <div className='flex items-center space-x-3'>
                          <div className='p-2 bg-vineyard-100 rounded-full'>
                            <Grape className='h-5 w-5 text-vineyard-600' />
                          </div>
                          <div>
                            <h3 className='font-semibold text-lg'>
                              {tripVineyard.vineyard.vineyard} {index + 1}
                            </h3>
                            <p className='text-sm text-gray-600'>
                              {tripVineyard.vineyard.sub_region}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center space-x-2'>
                          {!showVineyardTimeInputs[
                            tripVineyard.vineyard.vineyard_id
                          ] ? (
                            <div className='flex items-center space-x-2'>
                              {tripVineyard.time && (
                                <div className='flex items-center space-x-1 text-sm text-gray-600'>
                                  <Clock className='h-4 w-4' />
                                  <span>{tripVineyard.time}</span>
                                </div>
                              )}
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() =>
                                  toggleVineyardTimeInput(
                                    tripVineyard.vineyard.vineyard_id
                                  )
                                }
                                className='text-blue-600 hover:text-blue-700'
                              >
                                {tripVineyard.time ? 'Change Time' : 'Add Time'}
                              </Button>
                            </div>
                          ) : (
                            <div className='flex items-center space-x-2'>
                              <Input
                                type='time'
                                value={tripVineyard.time || '11:00'}
                                onChange={(e) =>
                                  handleVineyardTimeChange(
                                    tripVineyard.vineyard.vineyard_id,
                                    e.target.value
                                  )
                                }
                                className='w-32'
                              />
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() =>
                                  toggleVineyardTimeInput(
                                    tripVineyard.vineyard.vineyard_id
                                  )
                                }
                                className='text-gray-500 hover:text-gray-700'
                              >
                                <X className='h-4 w-4' />
                              </Button>
                            </div>
                          )}
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() =>
                              removeVineyard(tripVineyard.vineyard.vineyard_id)
                            }
                            className='text-red-600 hover:text-red-700'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>

                      {tripVineyard.offer && (
                        <div className='bg-vineyard-50 rounded-lg p-3'>
                          <div className='flex justify-between items-center'>
                            <div>
                              <p className='font-medium'>
                                {tripVineyard.offer.title}
                              </p>
                              <p className='text-sm text-gray-600'>
                                {tripVineyard.offer.duration}
                              </p>
                            </div>
                            <Badge variant='secondary'>
                              €{tripVineyard.offer.cost_per_adult}/person
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add Another Vineyard Button */}
                  {trip.vineyards.length < 3 && (
                    <div className='border-2 border-dashed border-vineyard-300 rounded-lg p-4 text-center'>
                      <Button
                        variant='outline'
                        onClick={() => router.push('/explore')}
                        className='border-vineyard-500 text-vineyard-600 hover:bg-vineyard-50'
                      >
                        <Plus className='h-4 w-4 mr-2' />
                        Add Another Vineyard ({trip.vineyards.length}/3)
                      </Button>
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
                        <p className='text-sm text-gray-600'>
                          {trip.restaurant.restaurant.sub_region}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-2'>
                      {!showRestaurantTimeInput ? (
                        <div className='flex items-center space-x-2'>
                          {restaurantTime && (
                            <div className='flex items-center space-x-1 text-sm text-gray-600'>
                              <Clock className='h-4 w-4' />
                              <span>{restaurantTime}</span>
                            </div>
                          )}
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={toggleRestaurantTimeInput}
                            className='text-blue-600 hover:text-blue-700'
                          >
                            {restaurantTime ? 'Change Time' : 'Add Time'}
                          </Button>
                        </div>
                      ) : (
                        <div className='flex items-center space-x-2'>
                          <Input
                            type='time'
                            value={restaurantTime}
                            onChange={(e) =>
                              handleRestaurantTimeChange(e.target.value)
                            }
                            className='w-32'
                          />
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={toggleRestaurantTimeInput}
                            className='text-gray-500 hover:text-gray-700'
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        </div>
                      )}
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={removeRestaurant}
                        className='text-red-600 hover:text-red-700'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
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
              {trip.vineyards.length === 0 && !trip.restaurant && (
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

              {/* Confirm Button */}
              {hasItems && (
                <>
                  <Separator />
                  <div className='text-center space-y-4'>
                    <h3 className='text-lg font-semibold'>
                      {hasUnsavedChanges
                        ? 'Save Your Changes'
                        : 'Ready to Confirm Your Plan?'}
                    </h3>
                    <p className='text-gray-600 text-sm'>
                      {hasUnsavedChanges
                        ? 'Your selections will be saved and confirmed. You can then access export options.'
                        : 'Once confirmed, your plan will be saved and you can access export options.'}
                    </p>
                    <Button
                      className='bg-vineyard-500 hover:bg-vineyard-600 text-white px-8 py-3 text-lg'
                      onClick={handleConfirmPlan}
                      disabled={confirming}
                    >
                      {confirming ? (
                        <>
                          <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                          {hasUnsavedChanges
                            ? 'Saving & Confirming...'
                            : 'Confirming...'}
                        </>
                      ) : hasUnsavedChanges ? (
                        'Save & Confirm Plan'
                      ) : (
                        'Confirm Plan'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </VineyardTourLayout>
  );
}
