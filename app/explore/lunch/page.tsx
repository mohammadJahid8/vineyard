import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import LunchPage from '@/components/lunch-page';
import { Restaurant } from '@/lib/types-vineyard';

async function getRestaurantsData(): Promise<Restaurant[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/restaurants`, {
    cache: 'force-cache', // Cache the data
  });

  if (!response.ok) {
    throw new Error('Failed to fetch restaurants data');
  }

  const result = await response.json();
  return result.data || [];
}

export default async function Lunch() {
  const session = await getServerSession(authOptions);

  // if (!session) {
  //   redirect('/sign-in');
  // }

  // Load restaurant data
  let restaurants: Restaurant[] = [];
  try {
    restaurants = await getRestaurantsData();
  } catch (error) {
    console.error('Failed to load restaurants:', error);
  }

  return <LunchPage restaurants={restaurants} />;
}
