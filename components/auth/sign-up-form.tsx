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
import { Mail, User, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SignUpForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('success');
      } else {
        setError(data.message || 'Failed to create account');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToSignIn = () => {
    router.push('/sign-in');
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      await signIn('google', { callbackUrl: '/plans' });
    } catch (error) {
      setError('Google sign-up failed. Please try again.');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('form');
    setFirstName('');
    setLastName('');
    setEmail('');
    setError('');
  };

  return (
    <Card className='shadow border-0 bg-white'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl text-center'>Create Account</CardTitle>
        <CardDescription className='text-center'>
          {step === 'form'
            ? 'Enter your details to create your account'
            : 'Account created successfully!'}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {error && (
          <div className='p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md'>
            {error}
          </div>
        )}

        {step === 'form' ? (
          <>
            <form onSubmit={handleFormSubmit} className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='firstName'>First Name</Label>
                  <div className='relative'>
                    <User className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                    <Input
                      id='firstName'
                      type='text'
                      placeholder='First name'
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className='pl-10'
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='lastName'>Last Name</Label>
                  <div className='relative'>
                    <User className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                    <Input
                      id='lastName'
                      type='text'
                      placeholder='Last name'
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className='pl-10'
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
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
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
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
              onClick={handleGoogleSignUp}
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
          <div className='space-y-6 text-center'>
            <div className='mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center'>
              <CheckCircle className='w-8 h-8 text-green-600' />
            </div>
            <div className='space-y-2'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Account Created Successfully!
              </h3>
              <p className='text-gray-600'>
                Your account has been created with email{' '}
                <strong>{email}</strong>. You can now sign in to access your
                account.
              </p>
            </div>
            <Button
              onClick={handleGoToSignIn}
              className='w-full bg-vineyard-500 hover:bg-vineyard-600'
            >
              Continue to Sign In
            </Button>
            <Button
              type='button'
              variant='ghost'
              className='w-full'
              onClick={resetForm}
            >
              Create Another Account
            </Button>
          </div>
        )}

        <div className='text-center text-sm'>
          <span className='text-gray-500'>Already have an account? </span>
          <Link
            href='/sign-in'
            className='text-vineyard-600 hover:text-vineyard-700 font-medium'
          >
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
