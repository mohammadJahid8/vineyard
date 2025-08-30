import { SignIn } from '@clerk/nextjs';

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
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-xl border-0 bg-white',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton:
                'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
              formButtonPrimary:
                'bg-vineyard-500 hover:bg-vineyard-600 text-white',
              footerActionLink: 'text-vineyard-600 hover:text-vineyard-700',
            },
          }}
        />
      </div>
    </div>
  );
}
