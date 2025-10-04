'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  hasNextPage,
  hasPrevPage,
}: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // Number of page buttons to show

    if (totalPages <= showPages) {
      // Show all pages if total pages is less than or equal to showPages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust the range to always show showPages - 2 pages (excluding first and last)
      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, showPages - 1);
      } else if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - showPages + 2);
      }

      // Add ellipsis if there's a gap after first page
      if (startPage > 2) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis if there's a gap before last page
      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className='flex items-center justify-between px-2 py-4'>
      <div className='flex items-center space-x-2'>
        <p className='text-sm text-gray-700'>
          Showing <span className='font-medium'>{startItem}</span> to{' '}
          <span className='font-medium'>{endItem}</span> of{' '}
          <span className='font-medium'>{totalCount}</span> results
        </p>
      </div>

      <div className='flex items-center space-x-6'>
        <div className='flex items-center space-x-2'>
          <p className='text-sm text-gray-700'>Rows per page</p>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent side='top'>
              {[5, 10, 20, 30, 50].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center space-x-2'>
          <p className='text-sm text-gray-700'>
            Page <span className='font-medium'>{currentPage}</span> of{' '}
            <span className='font-medium'>{totalPages}</span>
          </p>
        </div>

        <div className='flex items-center flex-wrap gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange(1)}
            disabled={!hasPrevPage}
            className='h-8 w-8 p-0'
          >
            <ChevronsLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevPage}
            className='h-8 w-8 p-0'
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>

          <div className='flex items-center flex-wrap gap-1'>
            {generatePageNumbers().map((page, index) => (
              <Button
                key={index}
                variant={page === currentPage ? 'default' : 'outline'}
                size='sm'
                onClick={() => typeof page === 'number' && onPageChange(page)}
                disabled={typeof page === 'string'}
                className='h-8 w-8 p-0'
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage}
            className='h-8 w-8 p-0'
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange(totalPages)}
            disabled={!hasNextPage}
            className='h-8 w-8 p-0'
          >
            <ChevronsRight className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  );
}
