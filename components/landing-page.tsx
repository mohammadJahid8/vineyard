'use client';

import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { ArrowRight, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';

export default function LandingPage() {
  const { data: session } = useSession();
  console.log('🚀 ~ LandingPage ~ session:', session);

  return (
    <div className='min-h-screen bg-gradient-to-br from-vineyard-50 via-white to-vineyard-100'>
      {/* Hero Section */}
      <section className='container mx-auto px-4 py-16 lg:py-24 text-center'>
        <div className='max-w-4xl mx-auto'>
          <Image
            src='/vineyard.png'
            alt='Vineyard Tour Planner'
            width={100}
            height={100}
            className='mx-auto mb-10'
          />

          <h2 className='text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6'>
            Plan a Perfect
            <br />
            <span className='text-vineyard-500'>Champagne Trip</span>
          </h2>
          <p className='text-lg md:text-xl text-vineyard-600 font-medium mb-2'>
            Spend minutes, not hours.
          </p>
          <p className='text-base md:text-lg text-gray-600 mb-8 max-w-2xl mx-auto'>
            Find the best vineyards, perfect lunch spot, and map your route
            instantly.
          </p>

          {/* Map Banner Image */}

          <Image
            width={100}
            height={100}
            src='/map_banner.png'
            alt='Map preview banner'
            className='rounded-md max-w-md w-full mx-auto mb-10 h-auto object-cover'
          />

          <div className='flex flex-col sm:flex-row gap-4 justify-center mb-12'>
            <Link href={session ? '/explore' : '/sign-up'}>
              <Button className='bg-vineyard-500 hover:bg-vineyard-600 text-white px-8 py-6 text-lg'>
                Get Started
              </Button>
            </Link>
          </div>

          {/* What You Get Section */}
          <div className='text-left max-w-2xl mx-auto'>
            <h3 className='text-2xl font-bold text-vineyard-600 mb-4'>
              What You Get
            </h3>
            <ul className='space-y-2 text-gray-700 mb-8'>
              <li className='flex items-start'>
                <span className='mr-2'>•</span>
                Discover 300+ vineyard experiences
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>•</span>
                Compare easily in one place
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>•</span>
                Select nearby lunch spots
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>•</span>
                Free & paid plans
              </li>
            </ul>

            <h3 className='text-2xl font-bold text-vineyard-600 mb-4'>
              What It Can't Do{' '}
              <span className='font-normal text-gray-600'>(by design)</span>
            </h3>
            <ul className='space-y-2 text-gray-700'>
              <li className='flex items-start'>
                <span className='mr-2'>•</span>
                Show live availability
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>•</span>
                Make bookings{' '}
                <a
                  href='mailto:contact@champagne-tour.com'
                  className='text-blue-600 ml-2 cursor-pointer hover:underline'
                >
                  contact@champagne-tour.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {/* <section className='container mx-auto px-4 py-16 bg-white/50'>
        <div className='text-center mb-12'>
          <h3 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
            Why Choose Our Wine Tour Planner?
          </h3>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            25 years of wine expertise combined with AI to create the perfect
            vineyard experience.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          <Card className='border-0 bg-vineyard-50 hover:shadow-lg transition-shadow'>
            <CardHeader className='text-center'>
              <div className='mx-auto mb-4 p-3 bg-vineyard-100 rounded-full w-fit'>
                <Grape className='h-8 w-8 text-vineyard-600' />
              </div>
              <CardTitle className='text-xl'>Expert Curation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-center'>
                Access to 300+ carefully selected vineyard experiences, curated
                by wine experts with 25 years of industry knowledge.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className='border-0 bg-vineyard-100 hover:shadow-lg transition-shadow'>
            <CardHeader className='text-center'>
              <div className='mx-auto mb-4 p-3 bg-vineyard-200 rounded-full w-fit'>
                <Zap className='h-8 w-8 text-vineyard-700' />
              </div>
              <CardTitle className='text-xl'>AI-Powered Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-center'>
                Smart recommendations for vineyards, restaurants, and routes
                based on your preferences and real-time availability.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className='border-0 bg-vineyard-50 hover:shadow-lg transition-shadow'>
            <CardHeader className='text-center'>
              <div className='mx-auto mb-4 p-3 bg-vineyard-100 rounded-full w-fit'>
                <MapPin className='h-8 w-8 text-vineyard-600' />
              </div>
              <CardTitle className='text-xl'>Perfect Routes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-center'>
                Optimized touring routes that maximize your time and minimize
                travel, ensuring you visit the best spots efficiently.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className='border-0 bg-vineyard-100 hover:shadow-lg transition-shadow'>
            <CardHeader className='text-center'>
              <div className='mx-auto mb-4 p-3 bg-vineyard-200 rounded-full w-fit'>
                <Clock className='h-8 w-8 text-vineyard-700' />
              </div>
              <CardTitle className='text-xl'>Save Time</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-center'>
                Plan in minutes, not hours. Our AI does the research so you can
                focus on enjoying your wine tour experience.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className='border-0 bg-vineyard-50 hover:shadow-lg transition-shadow'>
            <CardHeader className='text-center'>
              <div className='mx-auto mb-4 p-3 bg-vineyard-100 rounded-full w-fit'>
                <Shield className='h-8 w-8 text-vineyard-600' />
              </div>
              <CardTitle className='text-xl'>Trusted Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-center'>
                All recommendations backed by verified reviews and quality
                ratings from fellow wine enthusiasts.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className='border-0 bg-vineyard-100 hover:shadow-lg transition-shadow'>
            <CardHeader className='text-center'>
              <div className='mx-auto mb-4 p-3 bg-vineyard-200 rounded-full w-fit'>
                <Crown className='h-8 w-8 text-vineyard-700' />
              </div>
              <CardTitle className='text-xl'>Premium Experiences</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-center'>
                Access exclusive wine tastings, private tours, and premium
                dining experiences not available elsewhere.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className='bg-vineyard-500 text-white py-16'>
        <div className='container mx-auto px-4 text-center'>
          <h3 className='text-3xl md:text-4xl font-bold mb-4'>
            Ready to Start Your Wine Adventure?
          </h3>
          <p className='text-xl max-w-2xl mx-auto'>
            Join thousands of wine lovers who have discovered their perfect
            vineyard experiences with our expert guidance.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 text-white py-6'>
        <div className='container mx-auto px-4'>
          <div className='text-center text-gray-400'>
            <p>&copy; 2025 Vineyard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
