import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import ItineraryPage from '@/components/itinerary-page';

export default async function Itinerary() {
  const session = await getServerSession(authOptions);

  // if (!session) {
  //   redirect('/sign-in');
  // }

  return <ItineraryPage />;
}
