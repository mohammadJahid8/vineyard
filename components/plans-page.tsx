'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserButton } from '@clerk/nextjs';
import {
  Check,
  Grape,
  ArrowRight,
  Star,
  Lock,
  Zap,
  Crown,
  Gift,
  X,
} from 'lucide-react';
import { planOptions } from '@/lib/data';

import { useRouter } from 'next/navigation';

export default function PlansPage() {
  const router = useRouter();

  const handleSelectPlan = (planId: string) => {
    if (planId === 'free') {
      router.push('/explore');
    } else {
      // For now, show coming soon - future: navigate to payment screen
      alert(
        `${
          planOptions.find((p) => p.id === planId)?.name
        } plan coming soon! Upgrade functionality will be available soon.`
      );
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

  return (
    <div className='min-h-screen bg-gradient-to-br from-vineyard-50 via-white to-vineyard-100'>
      {/* Header */}
      <header className='border-b border-gray-200 bg-white/80 backdrop-blur-sm'>
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

      <div className='container mx-auto px-4 py-8 max-w-6xl'>
        {/* Hero Section */}
        <div className='text-center mb-12'>
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
            Choose Your Tour Plan
          </h2>
          <p className='text-xl text-gray-600 mb-2'>
            Combining 25 years of expertise with AI
          </p>
          <p className='text-lg text-gray-500 max-w-2xl mx-auto'>
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
                <p className='text-sm text-gray-500 mt-1'>{plan.duration}</p>
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

        {/* Mobile/Tablet Table View */}
        <div className='lg:hidden mb-8'>
          <div className='bg-white rounded-lg shadow-sm border overflow-hidden'>
            {/* Header with Plan Names */}
            <div className='bg-vineyard-500 text-white p-4'>
              <h3 className='text-xl font-bold text-center'>Plans</h3>
              <p className='text-center text-vineyard-100 text-sm mt-1'>
                Search over 300 Champagne Experiences
              </p>
            </div>

            {/* Plan Headers */}
            <div className='grid grid-cols-5 bg-gray-50 border-b'>
              <div className='p-3 text-xs font-medium text-gray-500'></div>
              {planOptions.map((plan) => (
                <div key={plan.id} className='p-3 text-center'>
                  <div
                    className={`inline-flex items-center justify-center w-16 h-8 rounded text-white text-xs font-medium ${
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

            {/* Table Rows */}
            <div className='divide-y divide-gray-200'>
              {/* Saved Selections */}
              <div className='grid grid-cols-5 py-3'>
                <div className='px-3 py-2 text-sm font-medium text-gray-900'>
                  Saved
                  <br />
                  Selections
                </div>
                {planOptions.map((plan) => (
                  <div
                    key={plan.id}
                    className='px-3 py-2 text-center text-sm font-medium'
                  >
                    {plan.features.savedSelections}
                  </div>
                ))}
              </div>

              {/* Saved For */}
              <div className='grid grid-cols-5 py-3 bg-gray-50'>
                <div className='px-3 py-2 text-sm font-medium text-gray-900'>
                  Saved For
                </div>
                {planOptions.map((plan) => (
                  <div key={plan.id} className='px-3 py-2 text-center text-sm'>
                    {plan.features.planSaved}
                  </div>
                ))}
              </div>

              {/* Quality Ratings */}
              <div className='grid grid-cols-5 py-3'>
                <div className='px-3 py-2 text-sm font-medium text-gray-900'>
                  Quality
                  <br />
                  Ratings
                </div>
                {planOptions.map((plan) => (
                  <div key={plan.id} className='px-3 py-2 text-center'>
                    {renderFeatureValue(plan.features.qualityRatings)}
                  </div>
                ))}
              </div>

              {/* Plan Download */}
              <div className='grid grid-cols-5 py-3 bg-gray-50'>
                <div className='px-3 py-2 text-sm font-medium text-gray-900'>
                  Plan Download
                </div>
                {planOptions.map((plan) => (
                  <div key={plan.id} className='px-3 py-2 text-center'>
                    {renderFeatureValue(plan.features.planDownload)}
                  </div>
                ))}
              </div>

              {/* Curated Offers */}
              <div className='grid grid-cols-5 py-3'>
                <div className='px-3 py-2 text-sm font-medium text-gray-900'>
                  Curated Offers
                </div>
                {planOptions.map((plan) => (
                  <div key={plan.id} className='px-3 py-2 text-center'>
                    {renderFeatureValue(plan.features.curatedOffers)}
                  </div>
                ))}
              </div>

              {/* Wine Hotels */}
              <div className='grid grid-cols-5 py-3 bg-gray-50'>
                <div className='px-3 py-2 text-sm font-medium text-gray-900'>
                  Wine Hotels
                </div>
                {planOptions.map((plan) => (
                  <div key={plan.id} className='px-3 py-2 text-center'>
                    {renderFeatureValue(plan.features.wineHotelBnB)}
                  </div>
                ))}
              </div>

              {/* Dinner Ideas */}
              <div className='grid grid-cols-5 py-3'>
                <div className='px-3 py-2 text-sm font-medium text-gray-900'>
                  Dinner Ideas
                </div>
                {planOptions.map((plan) => (
                  <div key={plan.id} className='px-3 py-2 text-center'>
                    {renderFeatureValue(plan.features.dinnerSuggestion)}
                  </div>
                ))}
              </div>

              {/* Premium Offers */}
              <div className='grid grid-cols-5 py-3 bg-gray-50'>
                <div className='px-3 py-2 text-sm font-medium text-gray-900'>
                  Premium Offers
                </div>
                {planOptions.map((plan) => (
                  <div key={plan.id} className='px-3 py-2 text-center'>
                    {renderFeatureValue(plan.features.premiumOffers)}
                  </div>
                ))}
              </div>

              {/* Wine Ratings */}
              <div className='grid grid-cols-5 py-3'>
                <div className='px-3 py-2 text-sm font-medium text-gray-900'>
                  Wine Ratings
                </div>
                {planOptions.map((plan) => (
                  <div key={plan.id} className='px-3 py-2 text-center'>
                    {renderFeatureValue(plan.features.wineRatings)}
                  </div>
                ))}
              </div>

              {/* Access to Q&A */}
              <div className='grid grid-cols-5 py-3 bg-gray-50'>
                <div className='px-3 py-2 text-sm font-medium text-gray-900'>
                  Access to Q&A
                </div>
                {planOptions.map((plan) => (
                  <div key={plan.id} className='px-3 py-2 text-center'>
                    {renderFeatureValue(plan.features.accessToQA)}
                  </div>
                ))}
              </div>

              {/* Next */}
              <div className='grid grid-cols-5 py-3'>
                <div className='px-3 py-2 text-sm font-medium text-gray-900'>
                  Next
                </div>
                {planOptions.map((plan) => (
                  <div key={plan.id} className='px-3 py-2 text-center'>
                    {renderFeatureValue(plan.features.aiAccess)}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className='grid grid-cols-4 gap-2 p-4 bg-gray-50'>
              {planOptions.map((plan) => (
                <Button
                  key={plan.id}
                  size='sm'
                  className={`text-xs ${
                    plan.id === 'free'
                      ? 'bg-vineyard-500 text-white hover:bg-vineyard-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.id === 'free' ? 'Start Free' : 'Coming Soon'}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <Card className='border-0 bg-vineyard-50'>
            <CardHeader className='text-center'>
              <div className='mx-auto mb-2 p-3 bg-vineyard-100 rounded-full w-fit'>
                <Grape className='h-6 w-6 text-vineyard-500' />
              </div>
              <CardTitle className='text-lg'>Expert Curation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-center'>
                25 years of wine expertise combined with AI to suggest the
                perfect vineyard experiences for your taste and preferences.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className='border-0 bg-vineyard-100'>
            <CardHeader className='text-center'>
              <div className='mx-auto mb-2 p-3 bg-vineyard-200 rounded-full w-fit'>
                <Zap className='h-6 w-6 text-vineyard-700' />
              </div>
              <CardTitle className='text-lg'>Smart Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-center'>
                AI-powered recommendations for vineyards, restaurants, and
                accommodations. Build your perfect wine tour effortlessly.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className='border-0 bg-vineyard-50'>
            <CardHeader className='text-center'>
              <div className='mx-auto mb-2 p-3 bg-vineyard-100 rounded-full w-fit'>
                <Crown className='h-6 w-6 text-vineyard-500' />
              </div>
              <CardTitle className='text-lg'>Premium Features</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-center'>
                Upgrade anytime to access PDF exports, wine ratings, premium
                offers, and exclusive wine hotel recommendations.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
