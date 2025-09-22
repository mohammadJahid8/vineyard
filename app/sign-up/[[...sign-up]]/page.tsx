import SignUpForm from '@/components/auth/sign-up-form';

export default function SignUpPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-vineyard-50 to-vineyard-100 p-4'>
      <div className='w-full max-w-md'>
        <SignUpForm />
      </div>
    </div>
  );
}
