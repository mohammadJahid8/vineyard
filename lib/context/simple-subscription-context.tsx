'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface UserSubscription {
  selectedPlan?: string;
  hasAccess: boolean;
  isAdmin: boolean;
  loading: boolean;
  expiresAt?: Date | null;
  isSubscriptionActive?: boolean;
}

interface SimpleSubscriptionContextType {
  subscription: UserSubscription;
  selectPlan: (planId: string) => Promise<void>;
  checkAccess: () => Promise<void>;
}

const SimpleSubscriptionContext = createContext<
  SimpleSubscriptionContextType | undefined
>(undefined);

export function SimpleSubscriptionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [subscription, setSubscription] = useState<UserSubscription>({
    hasAccess: false,
    isAdmin: false,
    loading: true,
    expiresAt: null,
    isSubscriptionActive: false,
  });

  const checkAccess = async () => {
    if (!session?.user?.email) {
      setSubscription({
        hasAccess: false,
        isAdmin: false,
        loading: false,
        expiresAt: null,
        isSubscriptionActive: false,
      });
      return;
    }

    try {
      const response = await fetch('/api/users/plan');
      const data = await response.json();

      if (data.success) {
        setSubscription({
          selectedPlan: data.data.selectedPlan,
          hasAccess: data.data.hasAccess || data.data.isAdmin,
          isAdmin: data.data.isAdmin,
          loading: false,
          expiresAt: data.data.subscriptionExpiresAt
            ? new Date(data.data.subscriptionExpiresAt)
            : null,
          isSubscriptionActive: data.data.isSubscriptionActive,
        });

        // If user doesn't have a plan, redirect to plans page
        if (!data.data.selectedPlan && data.success) {
          router.push('/plans');
        }
      } else {
        setSubscription({
          hasAccess: false,
          isAdmin: false,
          loading: false,
          expiresAt: null,
          isSubscriptionActive: false,
        });
        // Redirect to plans page if no plan
        router.push('/plans');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscription({
        hasAccess: false,
        isAdmin: false,
        loading: false,
        expiresAt: null,
        isSubscriptionActive: false,
      });
      router.push('/plans');
    }
  };

  const selectPlan = async (planId: string) => {
    try {
      const response = await fetch('/api/users/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: planId }),
      });

      if (response.ok) {
        await checkAccess(); // Refresh subscription status
        router.push('/explore'); // Redirect to explore page after selecting plan
      }
    } catch (error) {
      console.error('Error selecting plan:', error);
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      checkAccess();
    } else if (session !== undefined) {
      // Session is loaded but user is not authenticated
      setSubscription({
        hasAccess: false,
        isAdmin: false,
        loading: false,
        expiresAt: null,
        isSubscriptionActive: false,
      });
    }
  }, [session]);

  return (
    <SimpleSubscriptionContext.Provider
      value={{
        subscription,
        selectPlan,
        checkAccess,
      }}
    >
      {children}
    </SimpleSubscriptionContext.Provider>
  );
}

export function useSimpleSubscription() {
  const context = useContext(SimpleSubscriptionContext);
  if (context === undefined) {
    throw new Error(
      'useSimpleSubscription must be used within a SimpleSubscriptionProvider'
    );
  }
  return context;
}
