'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';

export function UserMenu() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  if (!session?.user) {
    return (
      <div className='flex items-center space-x-2'>
        <Button asChild variant='outline' size='sm'>
          <Link href='/sign-in'>Sign In</Link>
        </Button>
        <Button
          asChild
          size='sm'
          className='bg-vineyard-500 hover:bg-vineyard-600'
        >
          <Link href='/sign-up'>Sign Up</Link>
        </Button>
      </div>
    );
  }

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-10 w-10 rounded-full'>
          <Avatar className='h-10 w-10'>
            <AvatarImage
              src={session.user.image || ''}
              alt={session.user.name || 'User'}
            />
            <AvatarFallback className='bg-vineyard-100 text-vineyard-700'>
              {getInitials(session.user.name, session.user.email)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>
              {session.user.name || 'User'}
            </p>
            <p className='text-xs leading-none text-muted-foreground'>
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href='/profile' className='cursor-pointer'>
            <User className='mr-2 h-4 w-4' />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='cursor-pointer text-red-600 focus:text-red-600'
          onClick={handleSignOut}
          disabled={isLoading}
        >
          <LogOut className='mr-2 h-4 w-4' />
          {isLoading ? 'Signing out...' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
