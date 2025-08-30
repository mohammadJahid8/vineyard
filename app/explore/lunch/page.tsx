import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { readFileSync } from 'fs';
import { join } from 'path';
import LunchPage from '@/components/lunch-page';
import { Restaurant } from '@/lib/types-vineyard';

export default async function Lunch() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Load restaurant data
  let restaurants: Restaurant[] = [];
  try {
    const filePath = join(process.cwd(), 'public', 'restaurants.json');
    const fileContents = readFileSync(filePath, 'utf8');
    restaurants = JSON.parse(fileContents);
  } catch (error) {
    console.error('Failed to load restaurants:', error);
  }

  return <LunchPage restaurants={restaurants} />;
}
