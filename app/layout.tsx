import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TripProvider } from '@/lib/context/trip-context';
import { SimpleSubscriptionProvider } from '@/lib/context/simple-subscription-context';
import { SessionProvider } from '@/components/session-provider';
import { QueryProvider } from '@/lib/providers/query-provider';
import { Toaster } from '@/components/ui/sonner';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Vineyard Tour Planner',
  description: 'Plan your perfect vineyard tour experience',
  generator: 'champagne-tour',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <Suspense>
          <SessionProvider>
            <QueryProvider>
              <SimpleSubscriptionProvider>
                <TripProvider>
                  <div className='min-h-screen'>{children}</div>
                </TripProvider>
              </SimpleSubscriptionProvider>
            </QueryProvider>
          </SessionProvider>
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}
