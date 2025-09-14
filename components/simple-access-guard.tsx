'use client';

import { useSimpleSubscription } from '@/lib/context/simple-subscription-context';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface SimpleAccessGuardProps {
  children: React.ReactNode;
}

export function SimpleAccessGuard({ children }: SimpleAccessGuardProps) {
  const { subscription } = useSimpleSubscription();
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If session is loaded but user is not authenticated, redirect to sign-in
    if (session === null) {
      router.push('/sign-in');
      return;
    }

    // If subscription is loaded and user doesn't have access and is not admin, redirect to plans
    if (!subscription.loading && !subscription.hasAccess && session?.user) {
      router.push('/plans');
      return;
    }
  }, [session, subscription, router]);

  // If loading, show loading state
  if (subscription.loading || session === undefined) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-vineyard-50 via-white to-vineyard-100 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <Loader2 className='h-8 w-8 animate-spin text-vineyard-500 mb-4' />
            <h3 className='text-lg font-semibold mb-2'>Loading...</h3>
            <p className='text-gray-600 text-center'>Please wait...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is not authenticated, don't render anything (redirect handles this)
  if (!session) {
    return null;
  }

  // If user doesn't have access, don't render anything (redirect handles this)
  if (!subscription.hasAccess) {
    return null;
  }

  // User has access, render children
  return <>{children}</>;
}
