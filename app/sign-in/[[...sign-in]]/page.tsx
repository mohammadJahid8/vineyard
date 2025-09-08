import SignInForm from '@/components/auth/sign-in-form';

export default function SignInPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-vineyard-50 to-vineyard-100 p-4'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Welcome Back
          </h1>
          <p className='text-gray-600'>Sign in to your account</p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
