import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import DayTripPage from '@/components/day-trip-page';

export default async function DayTrip() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return <DayTripPage />;
}
