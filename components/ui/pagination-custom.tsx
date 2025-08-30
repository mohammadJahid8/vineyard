'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  className?: string;
}

export function PaginationCustom({
  currentPage,
  totalPages,
  baseUrl,
  className,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  const navigateToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      router.push(createPageUrl(page));
    }
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages();

  return (
    <div
      className={cn('flex items-center justify-center space-x-2', className)}
    >
      {/* Previous Button */}
      <Button
        variant='outline'
        size='sm'
        onClick={() => navigateToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className='h-9 w-9 p-0'
      >
        <ChevronLeft className='h-4 w-4' />
      </Button>

      {/* Page Numbers */}
      {visiblePages.map((page, index) => {
        if (page === '...') {
          return (
            <span key={`dots-${index}`} className='px-2 py-1 text-gray-500'>
              ...
            </span>
          );
        }

        const pageNumber = page as number;
        const isActive = pageNumber === currentPage;

        return (
          <Button
            key={pageNumber}
            variant={isActive ? 'default' : 'outline'}
            size='sm'
            onClick={() => navigateToPage(pageNumber)}
            className={cn('h-9 w-9 p-0', {
              'bg-vineyard-500 hover:bg-vineyard-600 text-white': isActive,
              'hover:bg-vineyard-50': !isActive,
            })}
          >
            {pageNumber}
          </Button>
        );
      })}

      {/* Next Button */}
      <Button
        variant='outline'
        size='sm'
        onClick={() => navigateToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className='h-9 w-9 p-0'
      >
        <ChevronRight className='h-4 w-4' />
      </Button>
    </div>
  );
}
