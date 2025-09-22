import { redirect } from 'next/navigation';

export default async function MapPage() {
  // Redirect to the plan page where the map now lives
  redirect('/explore/trip');
}
