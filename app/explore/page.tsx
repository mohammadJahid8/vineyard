import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ExplorePage from '@/components/explore-page';
import { Vineyard, Offer } from '@/lib/types-vineyard';

async function getVineyardsData(): Promise<Vineyard[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3003';
  const response = await fetch(`${baseUrl}/vineyards.json`, {
    cache: 'force-cache', // Cache the data
  });

  if (!response.ok) {
    throw new Error('Failed to fetch vineyards data');
  }

  return response.json();
}

async function getOffersData(): Promise<Offer[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3003';
  const response = await fetch(`${baseUrl}/offers.json`, {
    cache: 'force-cache', // Cache the data
  });

  if (!response.ok) {
    throw new Error('Failed to fetch offers data');
  }

  return response.json();
}

export default async function Explore() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Fetch data server-side using fetch
  const [vineyards, offers] = await Promise.all([
    getVineyardsData(),
    getOffersData(),
  ]);

  return <ExplorePage vineyards={vineyards} offers={offers} />;
}
