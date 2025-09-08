'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTrip } from '@/lib/context/trip-context';

interface NavigationWarningProps {
  message?: string;
}

export function NavigationWarning({
  message = 'You have unsaved changes. Are you sure you want to leave this page?',
}: NavigationWarningProps) {
  const { hasUnsavedChanges } = useTrip();
  const router = useRouter();

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    // Handle browser navigation (refresh, close, etc.)
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, message]);

  return null;
}
