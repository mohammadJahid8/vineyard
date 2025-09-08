import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import PlansPage from '@/components/plans-page';

export default async function Plans() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/sign-in');
  }

  return <PlansPage />;
}
