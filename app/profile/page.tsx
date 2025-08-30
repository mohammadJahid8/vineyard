import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ProfilePage from '@/components/profile-page';

export default async function Profile() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return <ProfilePage />;
}
