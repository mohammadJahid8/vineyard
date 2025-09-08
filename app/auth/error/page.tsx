'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The verification token has expired or has already been used.',
  Default: 'An error occurred during authentication.',
};

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const message =
    error && errorMessages[error]
      ? errorMessages[error]
      : errorMessages.Default;

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-vineyard-50 to-vineyard-100 p-4'>
      <Card className='w-full max-w-md shadow-xl border-0 bg-white'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100'>
            <AlertTriangle className='h-6 w-6 text-red-600' />
          </div>
          <CardTitle className='text-2xl text-gray-900'>
            Authentication Error
          </CardTitle>
          <CardDescription className='text-gray-600'>{message}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Button
            asChild
            className='w-full bg-vineyard-500 hover:bg-vineyard-600'
          >
            <Link href='/sign-in'>Try Again</Link>
          </Button>
          <Button asChild variant='outline' className='w-full'>
            <Link href='/'>Go Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
