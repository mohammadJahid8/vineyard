import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import PlanPage from '@/components/plan-page';

export default async function Plan() {
  const session = await getServerSession(authOptions);

  // if (!session) {
  //   redirect('/sign-in');
  // }

  return <PlanPage />;
}
