'use client';

import { Button } from '@/components/ui/button';
import { useSimpleSubscription } from '@/lib/context/simple-subscription-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  ArrowRight,
  Star,
  Lock,
  Zap,
  Crown,
  Gift,
  X,
  Grape,
} from 'lucide-react';
import { planOptions } from '@/lib/data';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function PlansPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { selectPlan } = useSimpleSubscription();
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = async (planId: string) => {
    if (!session?.user?.email) {
      // Handle case where user is not logged in
      router.push('/sign-in');
      return;
    }

    setLoading(true);
    try {
      await selectPlan(planId);
    } catch (error) {
      console.error('Error selecting plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Grape className='h-5 w-5' />;
      case 'plus':
        return <Zap className='h-5 w-5' />;
      case 'premium':
        return <Star className='h-5 w-5' />;
      case 'pro':
        return <Crown className='h-5 w-5' />;
      default:
        return <Grape className='h-5 w-5' />;
    }
  };

  const renderFeatureValue = (value: any) => {
    if (value === true) {
      return <Check className='w-4 h-4 text-vineyard-500' />;
    }
    if (value === false || value === '-') {
      return <X className='w-4 h-4 text-gray-400' />;
    }
    if (value === 'Yes') {
      return <Check className='w-4 h-4 text-vineyard-500' />;
    }
    return <span className='font-medium text-xs'>{value}</span>;
  };

  // Show loading while checking plan
  return (
    <div className='min-h-screen bg-gradient-to-br from-vineyard-50 via-white to-vineyard-100 pt-8'>
      <div className='container mx-auto px-4 py-8 max-w-6xl'>
        {/* Hero Section */}
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-5xl font-bold text-gray-900 mb-4'>
            Choose Your Tour Plan
          </h2>

          <p className='md:text-lg text-gray-500 max-w-2xl mx-auto'>
            Select the perfect plan for your vineyard adventure. Start with our
            free plan and upgrade anytime.
          </p>
        </div>

        {/* Desktop Plans Grid */}
        <div className='hidden lg:grid grid-cols-4 gap-6 mb-8'>
          {planOptions.map((plan) => (
            <Card
              key={plan.id}
              className={`relative transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? 'shadow-lg scale-105 border-vineyard-500 border-2'
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className='absolute -top-3 left-1/2 transform -translate-x-1/2'>
                  <Badge className='text-white px-3 py-1 bg-vineyard-500'>
                    <Star className='w-3 h-3 mr-1' />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className='text-center pb-4'>
                <div className='flex justify-center items-center mb-2 text-vineyard-500'>
                  {getPlanIcon(plan.id)}
                </div>
                <CardTitle className='text-2xl font-bold text-gray-900'>
                  {plan.name}
                </CardTitle>
                <div className='text-center'>
                  <span className='text-4xl font-bold text-vineyard-500'>
                    {plan.price === 0 ? 'Free' : `€${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className='text-gray-500'>/{plan.duration}</span>
                  )}
                </div>
              </CardHeader>

              <CardContent className='space-y-4'>
                <div className='space-y-3'>
                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-gray-600'>Saved Selections</span>
                    <span className='font-medium'>
                      {plan.features.savedSelections}
                    </span>
                  </div>
                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-gray-600'>Saved For</span>
                    <span className='font-medium'>
                      {plan.features.planSaved}
                    </span>
                  </div>
                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-gray-600'>Quality Ratings</span>
                    {renderFeatureValue(plan.features.qualityRatings)}
                  </div>
                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-gray-600'>Plan Download</span>
                    {renderFeatureValue(plan.features.planDownload)}
                  </div>
                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-gray-600'>Curated Offers</span>
                    {renderFeatureValue(plan.features.curatedOffers)}
                  </div>
                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-gray-600'>Wine Hotels</span>
                    {renderFeatureValue(plan.features.wineHotelBnB)}
                  </div>
                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-gray-600'>Dinner Ideas</span>
                    {renderFeatureValue(plan.features.dinnerSuggestion)}
                  </div>
                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-gray-600'>Premium Offers</span>
                    {renderFeatureValue(plan.features.premiumOffers)}
                  </div>
                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-gray-600'>Wine Ratings</span>
                    {renderFeatureValue(plan.features.wineRatings)}
                  </div>
                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-gray-600'>Access to Q&A</span>
                    {renderFeatureValue(plan.features.accessToQA)}
                  </div>
                </div>

                <Button
                  className={`w-full mt-6 ${
                    plan.id === 'free'
                      ? 'bg-vineyard-500 text-white hover:bg-vineyard-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loading}
                >
                  {plan.id === 'free' ? (
                    <>
                      Start Free Tour
                      <ArrowRight className='w-4 h-4 ml-2' />
                    </>
                  ) : (
                    <>
                      <Lock className='w-4 h-4 mr-2' />
                      Coming Soon
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile/Tablet Table View - FIXED */}
        <div className='lg:hidden mb-8'>
          <div className='bg-white rounded-lg shadow-sm border'>
            {/* Header stays fixed (no horizontal scroll) */}
            <div className='bg-vineyard-500 text-white p-4'>
              <h3 className='text-xl font-bold text-center'>Plans</h3>
              <p className='text-center text-vineyard-100 text-sm mt-1'>
                Search over 300 Champagne Experiences
              </p>
            </div>

            {/* Scroll only the comparison content on <=500px */}
            <div className='max-[500px]:overflow-x-auto'>
              <div className='max-[500px]:min-w-[500px]'>
                {/* Plan Headers with pricing */}
                <div className='grid grid-cols-5 bg-gray-50 border-b min-h-[80px]'>
                  <div className='p-2 text-xs font-medium text-gray-500 flex items-center'></div>
                  {planOptions.map((plan) => (
                    <div
                      key={plan.id}
                      className='p-2 text-center flex flex-col justify-center items-center'
                    >
                      <div
                        className={`inline-flex items-center justify-center w-full max-w-[60px] h-8 rounded text-white text-xs font-bold mb-1 ${
                          plan.id === 'free'
                            ? 'bg-vineyard-500'
                            : plan.id === 'plus'
                            ? 'bg-vineyard-600'
                            : plan.id === 'premium'
                            ? 'bg-vineyard-700'
                            : 'bg-vineyard-800'
                        }`}
                      >
                        {plan.name}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Table Rows - Fixed alignment and spacing */}
                <div className='divide-y divide-gray-200'>
                  {/* Saved Selections */}
                  <div className='grid grid-cols-5 min-h-[60px]'>
                    <div className='px-3 py-4 text-sm font-medium text-gray-900 flex items-center border-r border-gray-200'>
                      Saved Selections
                    </div>
                    {planOptions.map((plan) => (
                      <div
                        key={plan.id}
                        className='px-2 py-4 text-center text-sm font-bold text-vineyard-600 flex items-center justify-center'
                      >
                        {plan.features.savedSelections}
                      </div>
                    ))}
                  </div>

                  {/* Saved For */}
                  <div className='grid grid-cols-5 min-h-[60px] bg-gray-50'>
                    <div className='px-3 py-4 text-sm font-medium text-gray-900 flex items-center border-r border-gray-200'>
                      Saved For
                    </div>
                    {planOptions.map((plan) => (
                      <div
                        key={plan.id}
                        className='px-2 py-4 text-center text-xs font-medium flex items-center justify-center'
                      >
                        {plan.features.planSaved}
                      </div>
                    ))}
                  </div>

                  {/* Quality Ratings */}
                  <div className='grid grid-cols-5 min-h-[60px]'>
                    <div className='px-3 py-4 text-sm font-medium text-gray-900 flex items-center border-r border-gray-200'>
                      Quality Ratings
                    </div>
                    {planOptions.map((plan) => (
                      <div
                        key={plan.id}
                        className='px-2 py-4 flex items-center justify-center'
                      >
                        {renderFeatureValue(plan.features.qualityRatings)}
                      </div>
                    ))}
                  </div>

                  {/* Plan Download */}
                  <div className='grid grid-cols-5 min-h-[60px] bg-gray-50'>
                    <div className='px-3 py-4 text-sm font-medium text-gray-900 flex items-center border-r border-gray-200'>
                      Plan Download
                    </div>
                    {planOptions.map((plan) => (
                      <div
                        key={plan.id}
                        className='px-2 py-4 flex items-center justify-center'
                      >
                        {renderFeatureValue(plan.features.planDownload)}
                      </div>
                    ))}
                  </div>

                  {/* Curated Offers */}
                  <div className='grid grid-cols-5 min-h-[60px]'>
                    <div className='px-3 py-4 text-sm font-medium text-gray-900 flex items-center border-r border-gray-200'>
                      Curated Offers
                    </div>
                    {planOptions.map((plan) => (
                      <div
                        key={plan.id}
                        className='px-2 py-4 flex items-center justify-center'
                      >
                        {renderFeatureValue(plan.features.curatedOffers)}
                      </div>
                    ))}
                  </div>

                  {/* Wine Hotels */}
                  <div className='grid grid-cols-5 min-h-[60px] bg-gray-50'>
                    <div className='px-3 py-4 text-sm font-medium text-gray-900 flex items-center border-r border-gray-200'>
                      Wine Hotels
                    </div>
                    {planOptions.map((plan) => (
                      <div
                        key={plan.id}
                        className='px-2 py-4 flex items-center justify-center'
                      >
                        {renderFeatureValue(plan.features.wineHotelBnB)}
                      </div>
                    ))}
                  </div>

                  {/* Dinner Ideas */}
                  <div className='grid grid-cols-5 min-h-[60px]'>
                    <div className='px-3 py-4 text-sm font-medium text-gray-900 flex items-center border-r border-gray-200'>
                      Dinner Ideas
                    </div>
                    {planOptions.map((plan) => (
                      <div
                        key={plan.id}
                        className='px-2 py-4 flex items-center justify-center'
                      >
                        {renderFeatureValue(plan.features.dinnerSuggestion)}
                      </div>
                    ))}
                  </div>

                  {/* Premium Offers */}
                  <div className='grid grid-cols-5 min-h-[60px] bg-gray-50'>
                    <div className='px-3 py-4 text-sm font-medium text-gray-900 flex items-center border-r border-gray-200'>
                      Premium Offers
                    </div>
                    {planOptions.map((plan) => (
                      <div
                        key={plan.id}
                        className='px-2 py-4 flex items-center justify-center'
                      >
                        {renderFeatureValue(plan.features.premiumOffers)}
                      </div>
                    ))}
                  </div>

                  {/* Wine Ratings */}
                  <div className='grid grid-cols-5 min-h-[60px]'>
                    <div className='px-3 py-4 text-sm font-medium text-gray-900 flex items-center border-r border-gray-200'>
                      Wine Ratings
                    </div>
                    {planOptions.map((plan) => (
                      <div
                        key={plan.id}
                        className='px-2 py-4 flex items-center justify-center'
                      >
                        {renderFeatureValue(plan.features.wineRatings)}
                      </div>
                    ))}
                  </div>

                  {/* Access to Q&A */}
                  <div className='grid grid-cols-5 min-h-[60px] bg-gray-50'>
                    <div className='px-3 py-4 text-sm font-medium text-gray-900 flex items-center border-r border-gray-200'>
                      Access to Q&A
                    </div>
                    {planOptions.map((plan) => (
                      <div
                        key={plan.id}
                        className='px-2 py-4 flex items-center justify-center'
                      >
                        {renderFeatureValue(plan.features.accessToQA)}
                      </div>
                    ))}
                  </div>

                  {/* AI Access */}
                  <div className='grid grid-cols-5 min-h-[60px]'>
                    <div className='px-3 py-4 text-sm font-medium text-gray-900 flex items-center border-r border-gray-200'>
                      AI Access
                    </div>
                    {planOptions.map((plan) => (
                      <div
                        key={plan.id}
                        className='px-2 py-4 flex items-center justify-center'
                      >
                        {renderFeatureValue(plan.features.aiAccess)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons - Fixed spacing */}
                <div className='grid grid-cols-4 gap-2 p-3 bg-gray-50'>
                  {planOptions.map((plan) => (
                    <Button
                      key={plan.id}
                      size='sm'
                      className={`text-xs h-9 whitespace-nowrap min-w-[80px] ${
                        plan.id === 'free'
                          ? 'bg-vineyard-500 text-white hover:bg-vineyard-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={loading}
                    >
                      {plan.id === 'free' ? 'Start Free' : 'Coming Soon'}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            {/* </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
