import SignUpForm from '@/components/auth/sign-up-form';

export default function SignUpPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-vineyard-50 to-vineyard-100 p-4'>
      <div className='w-full max-w-md'>
        {/* <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Get Started</h1>
          <p className='text-gray-600'>Create your account</p>
        </div> */}
        <SignUpForm />
      </div>
    </div>
  );
}
