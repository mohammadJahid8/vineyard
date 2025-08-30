import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import PlansPage from '@/components/plans-page';

export default async function Plans() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return <PlansPage />;
}
