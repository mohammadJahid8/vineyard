'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Mail, Key, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userNotFound, setUserNotFound] = useState(false);
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setUserNotFound(false);

    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('otp');
      } else {
        if (response.status === 404 && data.data?.userExists === false) {
          setUserNotFound(true);
          setError('User not found. Please sign up first.');
        } else {
          setError(data.message || 'Failed to send OTP');
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('otp', {
        email,
        otp,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid OTP. Please try again.');
      } else if (result?.ok) {
        // Get session to redirect properly
        const session = await getSession();
        if (session) {
          router.push('/plans');
          router.refresh();
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn('google', { callbackUrl: '/plans' });
    } catch (error) {
      setError('Google sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('email');
    setOTP('');
    setError('');
    setUserNotFound(false);
  };

  return (
    <Card className='shadow-xl border-0 bg-white'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl text-center'>Sign In</CardTitle>
        <CardDescription className='text-center'>
          {step === 'email'
            ? 'Enter your email to receive a login code'
            : 'Enter the 6-digit code sent to your email'}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {error && (
          <div
            className={`p-3 text-sm rounded-md flex items-center space-x-2 ${
              userNotFound
                ? 'text-amber-600 bg-amber-50 border border-amber-200'
                : 'text-red-600 bg-red-50 border border-red-200'
            }`}
          >
            <AlertCircle className='h-4 w-4 flex-shrink-0' />
            <span>{error}</span>
          </div>
        )}

        {step === 'email' ? (
          <>
            <form onSubmit={handleEmailSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                  <Input
                    id='email'
                    type='email'
                    placeholder='Enter your email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='pl-10'
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <Button
                type='submit'
                className='w-full bg-vineyard-500 hover:bg-vineyard-600'
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Sending...
                  </>
                ) : (
                  'Send Login Code'
                )}
              </Button>
            </form>

            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <Separator className='w-full' />
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-white px-2 text-gray-500'>
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              variant='outline'
              className='w-full'
              disabled={loading}
            >
              <svg className='mr-2 h-4 w-4' viewBox='0 0 24 24'>
                <path
                  d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                  fill='#4285F4'
                />
                <path
                  d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                  fill='#34A853'
                />
                <path
                  d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                  fill='#FBBC05'
                />
                <path
                  d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                  fill='#EA4335'
                />
              </svg>
              Continue with Google
            </Button>
          </>
        ) : (
          <form onSubmit={handleOTPSubmit} className='space-y-4'>
            <div className='space-y-2 text-center'>
              <Label htmlFor='otp'>Verification Code</Label>
              <div className='flex justify-center mt-2'>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOTP(value)}
                  disabled={loading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className='text-sm text-gray-500 text-center'>
                Code sent to {email}
              </p>
            </div>
            <Button
              type='submit'
              className='w-full bg-vineyard-500 hover:bg-vineyard-600'
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Verifying...
                </>
              ) : (
                'Verify & Sign In'
              )}
            </Button>
            <Button
              type='button'
              variant='ghost'
              className='w-full'
              onClick={resetForm}
              disabled={loading}
            >
              Use different email
            </Button>
          </form>
        )}

        <div className='text-center text-sm'>
          <span className='text-gray-500'>Don't have an account? </span>
          <Link
            href='/sign-up'
            className='text-vineyard-600 hover:text-vineyard-700 font-medium'
          >
            Sign up
          </Link>
        </div>

        {userNotFound && (
          <div className='text-center'>
            <Button
              onClick={() => router.push('/sign-up')}
              className='bg-vineyard-500 hover:bg-vineyard-600 text-white'
            >
              Create Account
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
