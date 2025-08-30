import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ItineraryPage from '@/components/itinerary-page';

export default async function Itinerary() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return <ItineraryPage />;
}
