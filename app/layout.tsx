import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TripProvider } from '@/lib/context/trip-context';
import { SimpleSubscriptionProvider } from '@/lib/context/simple-subscription-context';
import { SessionProvider } from '@/components/session-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Vineyard Tour Planner',
  description: 'Plan your perfect vineyard tour experience',
  generator: 'v0.dev',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <SessionProvider>
          <SimpleSubscriptionProvider>
            <TripProvider>
              <div className='min-h-screen'>{children}</div>
            </TripProvider>
          </SimpleSubscriptionProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
