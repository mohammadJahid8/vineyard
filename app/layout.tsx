import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { TripProvider } from '@/lib/context/trip-context';

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
    <ClerkProvider afterSignOutUrl='/' afterSignInUrl='/plans'>
      <html lang='en'>
        <body className={inter.className}>
          <TripProvider>
            <div className='min-h-screen pb-16'>{children}</div>
          </TripProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
