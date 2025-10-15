'use client';

import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { SimpleAccessGuard } from '@/components/simple-access-guard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSession, signOut } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Crown, Star, Zap, Grape, Clock, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [userPlan, setUserPlan] = useState<{
    selectedPlan?: string;
    planSelectedAt?: string;
    subscriptionExpiresAt?: string;
    isSubscriptionActive?: boolean;
    hasAccess?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut({
        callbackUrl: '/',
        redirect: true,
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/users/plan');
          if (response.ok) {
            const data = await response.json();
            setUserPlan(data.data);
          }
        } catch (error) {
          console.error('Failed to fetch user plan:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserPlan();
  }, [session]);

  const getPlanIcon = (planId?: string) => {
    switch (planId) {
      case 'free':
        return '';
      case 'plus':
        return <Zap className='h-5 w-5' />;
      case 'premium':
        return <Star className='h-5 w-5' />;
      case 'pro':
        return <Crown className='h-5 w-5' />;
      default:
        return <User className='h-5 w-5' />;
    }
  };

  const getTimeRemaining = () => {
    if (!userPlan?.subscriptionExpiresAt) return 'No expiry';
    const now = new Date();
    const expiry = new Date(userPlan.subscriptionExpiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h left`;
    if (hours > 0) return `${hours}h ${minutes % 60}m left`;
    return `${minutes}m left`;
  };

  const getPlanName = (planId?: string) => {
    switch (planId) {
      case 'free':
        return 'Free Plan';
      case 'plus':
        return 'Plus Plan';
      case 'premium':
        return 'Premium Plan';
      case 'pro':
        return 'Pro Plan';
      default:
        return 'No Plan Selected';
    }
  };

  const getPlanColor = (planId?: string) => {
    switch (planId) {
      case 'free':
        return 'bg-green-100 text-green-800';
      case 'plus':
        return 'bg-blue-100 text-blue-800';
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      case 'pro':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <SimpleAccessGuard>
      <div className='min-h-screen bg-gradient-to-br from-vineyard-50 via-white to-vineyard-100 pb-20 pt-8'>
        {/* Content */}
        <div className='container mx-auto px-4 py-8 max-w-2xl'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='h-5 w-5' />
                Profile Information
              </CardTitle>
              <CardDescription>
                Manage your account settings and personal information.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid gap-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='name'>Name</Label>
                  <Input
                    id='name'
                    value={session?.user?.name || ''}
                    placeholder='Your full name'
                    disabled
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    value={session?.user?.email || ''}
                    placeholder='your.email@example.com'
                    disabled
                  />
                </div>
              </div>

              {/* Subscription Plan */}
              <div className='border-t pt-6'>
                <div className='flex items-center gap-2 mb-3'>
                  <h3 className='text-lg font-semibold'>Subscription Plan</h3>
                  {!loading && (
                    <Badge className={getPlanColor(userPlan?.selectedPlan)}>
                      <div className='flex items-center gap-1'>
                        {getPlanIcon(userPlan?.selectedPlan)}
                        {getPlanName(userPlan?.selectedPlan)}
                      </div>
                    </Badge>
                  )}
                </div>

                {loading ? (
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <div className='animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-vineyard-500'></div>
                    Loading plan information...
                  </div>
                ) : userPlan?.selectedPlan ? (
                  <div className='text-sm text-gray-600 space-y-2'>
                    <p>
                      Plan selected on:{' '}
                      {userPlan.planSelectedAt
                        ? new Date(userPlan.planSelectedAt).toLocaleDateString()
                        : 'Unknown'}
                    </p>
                    <div className='flex items-center gap-2'>
                      <Clock className='h-4 w-4' />
                      <span
                        className={`font-medium ${
                          getTimeRemaining() === 'Expired'
                            ? 'text-red-600'
                            : getTimeRemaining().includes('m left') &&
                              !getTimeRemaining().includes('h')
                            ? 'text-amber-600'
                            : 'text-green-600'
                        }`}
                      >
                        {getTimeRemaining()}
                      </span>
                    </div>
                    {userPlan.selectedPlan !== 'free' && (
                      <p className='mt-1 text-blue-600'>
                        Premium features are coming soon!
                      </p>
                    )}
                  </div>
                ) : (
                  <div className='text-sm text-gray-600'>
                    <p>No subscription plan selected yet.</p>
                    <Button
                      className='mt-2 bg-vineyard-500 hover:bg-vineyard-600'
                      size='sm'
                      onClick={() => (window.location.href = '/plans')}
                    >
                      Choose a Plan
                    </Button>
                  </div>
                )}
              </div>

              {/* Sign Out Section */}
              <div className='border-t pt-6'>
                <div className='flex flex-col space-y-3'>
                  <h3 className='text-lg font-semibold'>Account Actions</h3>
                  <Button
                    variant='outline'
                    onClick={handleSignOut}
                    className='w-full justify-center border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300'
                  >
                    <LogOut className='h-4 w-4 mr-2' />
                    Sign Out
                  </Button>
                  <p className='text-xs text-gray-500 text-center'>
                    You will be redirected to the home page
                  </p>
                </div>
              </div>

              {/* <div className='pt-4'>
                <p className='text-sm text-gray-600'>
                  Profile information is automatically synced from your
                  authentication provider. To update your information, please
                  use your Google account settings.
                </p>
              </div> */}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </SimpleAccessGuard>
  );
}
