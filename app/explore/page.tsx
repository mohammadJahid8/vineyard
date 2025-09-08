import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import ExplorePage from '@/components/explore-page';
import { Vineyard, Offer } from '@/lib/types-vineyard';

async function getVineyardsData(): Promise<Vineyard[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/vineyards`, {
    cache: 'force-cache', // Cache the data
  });

  if (!response.ok) {
    throw new Error('Failed to fetch vineyards data');
  }

  const result = await response.json();
  return result.data || [];
}

async function getOffersData(): Promise<Offer[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/offers`, {
    cache: 'force-cache', // Cache the data
  });

  if (!response.ok) {
    throw new Error('Failed to fetch offers data');
  }

  const result = await response.json();
  return result.data || [];
}

export default async function Explore() {
  const session = await getServerSession(authOptions);

  // if (!session) {
  //   redirect('/sign-in');
  // }

  // Fetch data server-side using fetch
  const [vineyards, offers] = await Promise.all([
    getVineyardsData(),
    getOffersData(),
  ]);

  // console.log('🚀 ~ Explore ~ vineyards:', vineyards);
  // console.log('🚀 ~ Explore ~ offers:', offers);

  return <ExplorePage vineyards={vineyards} offers={offers} />;
}
