import SignInForm from '@/components/auth/sign-in-form';

export default function SignInPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-vineyard-50 to-vineyard-100 p-4'>
      <div className='w-full max-w-md'>
        <SignInForm />
      </div>
    </div>
  );
}
