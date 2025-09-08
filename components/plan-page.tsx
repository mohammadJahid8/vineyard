'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import VineyardTourLayout from '@/components/layouts/vineyard-tour-layout';
import {
  Grape,
  Utensils,
  Clock,
  Mail,
  Download,
  Share2,
  CheckCircle,
  Loader2,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface ConfirmedPlan {
  id: string;
  title: string;
  vineyards: any[];
  restaurant?: any;
  status: string;
  confirmedAt: string;
  expiresAt: string;
}

export default function PlanPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [plan, setPlan] = useState<ConfirmedPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);

  useEffect(() => {
    const loadConfirmedPlan = async () => {
      // if (!session?.user?.id) {
      //   router.push('/sign-in');
      //   return;
      // }

      try {
        setLoading(true);
        setError('');

        // Load existing confirmed plan
        const response = await fetch('/api/plans?type=confirmed');
        const data = await response.json();

        if (data.success && data.data.plans && data.data.plans.length > 0) {
          // Show the most recent confirmed plan
          const confirmedPlan = data.data.plans[0];
          setExpiryTime(new Date(confirmedPlan.expiresAt));

          // Check if plan is expired
          if (new Date(confirmedPlan.expiresAt) <= new Date()) {
            // Plan is expired, show nothing
            setPlan(null);
          } else {
            setPlan(confirmedPlan);
          }
        } else {
          // No confirmed plan found, redirect to review page
          router.push('/explore/review');
          return;
        }
      } catch (err) {
        setError('Failed to load plan. Please try again.');
        console.error('Plan loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadConfirmedPlan();
  }, [session?.user?.id, router]);

  const handleExportPDF = async () => {
    // TODO: Implement PDF export
    console.log('Export PDF');
  };

  const handleEmailPDF = async () => {
    // TODO: Implement email PDF
    console.log('Email PDF');
  };

  const handleShare = async () => {
    // TODO: Implement share functionality
    console.log('Share plan');
  };

  const handleMapView = () => {
    // Navigate to map view with plan data
    router.push(`/explore/map?planId=${plan?.id}`);
  };

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!expiryTime) return null;
    const now = new Date();
    const remaining = expiryTime.getTime() - now.getTime();
    if (remaining <= 0) return null;

    const minutes = Math.floor(remaining / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const timeRemaining = getTimeRemaining();
  const isExpiringSoon =
    expiryTime && expiryTime.getTime() - new Date().getTime() < 2 * 60 * 1000; // Less than 2 minutes

  if (loading) {
    return (
      <VineyardTourLayout
        currentStep='plan'
        title='Loading Your Plan'
        subtitle='Please wait while we load your confirmed plan'
      >
        <div className='container mx-auto px-4 py-8'>
          <div className='max-w-4xl mx-auto'>
            <Card>
              <CardContent className='flex flex-col items-center justify-center py-12'>
                <Loader2 className='h-8 w-8 animate-spin text-vineyard-500 mb-4' />
                <h3 className='text-lg font-semibold mb-2'>Loading...</h3>
                <p className='text-gray-600 text-center'>
                  Please wait while we load your confirmed plan.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </VineyardTourLayout>
    );
  }

  if (error) {
    return (
      <VineyardTourLayout
        currentStep='plan'
        title='Plan Error'
        subtitle='There was an issue with your plan'
      >
        <div className='container mx-auto px-4 py-8'>
          <div className='max-w-4xl mx-auto'>
            <Card>
              <CardContent className='flex flex-col items-center justify-center py-12'>
                <AlertCircle className='h-8 w-8 text-red-500 mb-4' />
                <h3 className='text-lg font-semibold mb-2 text-red-700'>
                  Error Loading Plan
                </h3>
                <p className='text-gray-600 text-center mb-4'>{error}</p>
                <div className='space-x-2'>
                  <Button
                    onClick={() => router.push('/explore/review')}
                    variant='outline'
                  >
                    Back to Review
                  </Button>
                  <Button
                    onClick={() => window.location.reload()}
                    className='bg-vineyard-500 hover:bg-vineyard-600'
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </VineyardTourLayout>
    );
  }

  // If no plan (expired or not found), show empty state
  if (!plan) {
    return (
      <VineyardTourLayout
        currentStep='plan'
        title='No Active Plan'
        subtitle='Your plan may have expired or not been confirmed yet'
      >
        <div className='container mx-auto px-4 py-8'>
          <div className='max-w-4xl mx-auto'>
            <Card>
              <CardContent className='flex flex-col items-center justify-center py-12'>
                <Clock className='h-12 w-12 text-gray-400 mb-4' />
                <h3 className='text-xl font-semibold mb-2 text-gray-700'>
                  No Plan Available
                </h3>
                <p className='text-gray-600 text-center'>
                  Your plan may have expired or hasn't been confirmed yet.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </VineyardTourLayout>
    );
  }

  const displayData = plan;

  return (
    <VineyardTourLayout
      currentStep='plan'
      title='Your Confirmed Plan'
      subtitle='Your itinerary is confirmed and ready to export'
    >
      {/* Content */}
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto'>
          <Card>
            <CardHeader className='text-center'>
              <div className='flex items-center justify-center mb-2'>
                <CheckCircle className='h-8 w-8 text-green-500 mr-2' />
                <CardTitle className='text-3xl text-green-700'>
                  Plan Confirmed!
                </CardTitle>
              </div>
              <p className='text-gray-600'>{displayData.title}</p>
              {plan && (
                <p className='text-sm text-gray-500'>
                  Confirmed on {new Date(plan.confirmedAt).toLocaleDateString()}
                </p>
              )}
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Expiry Warning */}
              {timeRemaining && (
                <div
                  className={`p-3 rounded-lg border ${
                    isExpiringSoon
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-amber-50 border-amber-200 text-amber-700'
                  }`}
                >
                  <div className='flex items-center space-x-2'>
                    <Clock className='h-4 w-4' />
                    <span className='text-sm font-medium'>
                      {isExpiringSoon
                        ? `⚠️ Plan expires in ${timeRemaining}!`
                        : `Plan expires in ${timeRemaining}`}
                    </span>
                  </div>
                </div>
              )}

              {/* Vineyard Visits */}
              {displayData.vineyards && displayData.vineyards.length > 0 ? (
                <div className='space-y-4'>
                  <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                    Your Vineyard Visits
                  </h3>
                  {displayData.vineyards.map(
                    (planVineyard: any, index: number) => (
                      <div
                        key={
                          planVineyard.vineyardId ||
                          planVineyard.vineyard?.vineyard_id ||
                          index
                        }
                        className='border rounded-lg p-4 bg-white'
                      >
                        <div className='flex items-start justify-between mb-4'>
                          <div className='flex items-center space-x-3'>
                            <div className='p-2 bg-vineyard-100 rounded-full'>
                              <Grape className='h-5 w-5 text-vineyard-600' />
                            </div>
                            <div>
                              <h4 className='font-semibold text-lg'>
                                {planVineyard.vineyard?.vineyard ||
                                  planVineyard.vineyard?.name}{' '}
                                {index + 1}
                              </h4>
                              <p className='text-sm text-gray-600'>
                                {planVineyard.vineyard?.sub_region ||
                                  planVineyard.vineyard?.region}
                              </p>
                            </div>
                          </div>
                          {planVineyard.time && (
                            <div className='flex items-center space-x-1 text-sm text-gray-600'>
                              <Clock className='h-4 w-4' />
                              <span>{planVineyard.time}</span>
                            </div>
                          )}
                        </div>

                        {planVineyard.offer && (
                          <div className='bg-vineyard-50 rounded-lg p-3'>
                            <div className='flex justify-between items-center'>
                              <div>
                                <p className='font-medium'>
                                  {planVineyard.offer.title}
                                </p>
                                <p className='text-sm text-gray-600'>
                                  {planVineyard.offer.duration}
                                </p>
                              </div>
                              <Badge variant='secondary'>
                                €{planVineyard.offer.cost_per_adult}/person
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              ) : null}

              {/* Restaurant/Lunch */}
              {displayData.restaurant && (
                <div className='border rounded-lg p-4 bg-white'>
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex items-center space-x-3'>
                      <div className='p-2 bg-orange-100 rounded-full'>
                        <Utensils className='h-5 w-5 text-orange-600' />
                      </div>
                      <div>
                        <h4 className='font-semibold text-lg'>
                          {displayData.restaurant.restaurant?.restaurants ||
                            displayData.restaurant.restaurant?.name}
                        </h4>
                        <p className='text-sm text-gray-600'>
                          {displayData.restaurant.restaurant?.sub_region ||
                            displayData.restaurant.restaurant?.region}
                        </p>
                      </div>
                    </div>
                    {displayData.restaurant.time && (
                      <div className='flex items-center space-x-1 text-sm text-gray-600'>
                        <Clock className='h-4 w-4' />
                        <span>{displayData.restaurant.time}</span>
                      </div>
                    )}
                  </div>

                  <div className='bg-orange-50 rounded-lg p-3'>
                    <div className='flex justify-between items-center'>
                      <div>
                        <p className='font-medium'>
                          {displayData.restaurant.restaurant?.actual_type ||
                            'Lunch'}
                        </p>
                        <p className='text-sm text-gray-600'>
                          {displayData.restaurant.restaurant?.open_days ||
                            'Check availability'}
                        </p>
                      </div>
                      <Badge variant='secondary'>
                        €
                        {displayData.restaurant.restaurant
                          ?.avg_est_lunch_cost || '25'}
                        /person
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Map View */}
              <Separator />
              <div className='text-center space-y-4'>
                <h3 className='text-lg font-semibold'>View Your Route</h3>
                <Button
                  onClick={handleMapView}
                  className='bg-green-600 hover:bg-green-700 w-full md:w-auto'
                >
                  <MapPin className='h-4 w-4 mr-2' />
                  Map View
                </Button>
              </div>

              {/* Export Options */}
              <Separator />
              <div className='text-center space-y-4'>
                <h3 className='text-lg font-semibold'>Export Your Itinerary</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Button
                    onClick={handleEmailPDF}
                    className='bg-blue-600 hover:bg-blue-700'
                  >
                    <Mail className='h-4 w-4 mr-2' />
                    Email PDF
                  </Button>
                  <Button
                    onClick={handleExportPDF}
                    className='bg-vineyard-500 hover:bg-vineyard-600'
                  >
                    <Download className='h-4 w-4 mr-2' />
                    Download PDF
                  </Button>
                </div>
                <Button
                  onClick={handleShare}
                  variant='outline'
                  className='w-full md:w-auto'
                >
                  <Share2 className='h-4 w-4 mr-2' />
                  Share Itinerary
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </VineyardTourLayout>
  );
}
