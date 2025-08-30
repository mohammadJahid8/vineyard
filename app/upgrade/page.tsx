import { redirect } from 'next/navigation';

export default function UpgradePage() {
  // For now, redirect back to plans page
  // In the future, this would show payment options
  redirect('/plans');
}
