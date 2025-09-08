'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter } from 'lucide-react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { RestaurantFilterState } from '@/lib/types-vineyard';

interface RestaurantFiltersProps {
  onFiltersChange: (filters: RestaurantFilterState) => void;
  className?: string;
}

const typeOptions = [
  { value: 'French', label: 'French' },
  { value: 'Brasserie', label: 'Brasserie' },
  { value: 'Wine Bar', label: 'Wine Bar' },
  { value: 'Steak', label: 'Steak' },
  { value: 'Seafood', label: 'Seafood' },
];

const costOptions = [
  { value: 'under-25', label: 'Under €25' },
  { value: '25-40', label: '€25 - €40' },
  { value: '40-70', label: '€40 - €70' },
  { value: '70+', label: '€70+' },
];

const distanceOptions = [
  { value: 'under-2', label: 'Under 2km' },
  { value: '2-30', label: 'Up to 30km' },
];

const locationOptions = [
  { value: 'reims city', label: 'Reims City' },
  { value: 'reims mountain', label: 'Reims Mountain' },
  { value: 'epernay city', label: 'Epernay City' },
  { value: 'near epernay', label: 'Near Epernay' },
  { value: 'marne valley', label: 'Marne Valley' },
  { value: 'côte des blancs', label: 'Côte des Blancs' },
  { value: 'further south', label: 'Further South' },
];

const startingPointOptions = [
  { value: 'all', label: 'All Starting Points' },
  { value: 'client', label: 'Client Enters' },
  { value: 'vineyard', label: 'Vineyard Selected' },
];

export function RestaurantFilters({
  onFiltersChange,
  className,
}: RestaurantFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize filters from URL parameters
  const getInitialFilters = (): RestaurantFilterState => {
    return {
      area: searchParams.get('area') || '',
      type: searchParams.get('type') || '',
      cost: searchParams.get('cost') || '',
      rating: searchParams.get('rating') || 'all',
      search: searchParams.get('search') || '',
      distance: searchParams.get('distance') || '',
      startingPoint: searchParams.get('startingPoint') || 'all',
    };
  };

  const [appliedFilters, setAppliedFilters] =
    useState<RestaurantFilterState>(getInitialFilters);
  const [tempFilters, setTempFilters] =
    useState<RestaurantFilterState>(getInitialFilters);
  const [searchInput, setSearchInput] = useState(getInitialFilters().search);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  const filtersRef = useRef(appliedFilters);

  // Keep ref in sync with applied filters
  useEffect(() => {
    filtersRef.current = appliedFilters;
  }, [appliedFilters]);

  // Update URL when filters change
  const updateURL = (newFilters: RestaurantFilterState) => {
    const params = new URLSearchParams();

    // Only add non-default values to URL
    if (newFilters.area !== '') params.set('area', newFilters.area);
    if (newFilters.type !== '') params.set('type', newFilters.type);
    if (newFilters.cost !== '') params.set('cost', newFilters.cost);
    if (newFilters.rating !== 'all') params.set('rating', newFilters.rating);
    if (newFilters.distance !== '') params.set('distance', newFilters.distance);
    if (newFilters.search) params.set('search', newFilters.search);

    const paramString = params.toString();
    const newUrl = paramString ? `?${paramString}` : window.location.pathname;

    router.replace(newUrl, { scroll: false });
  };

  // Check if required filters are selected in temp filters
  const hasRequiredTempFilters = useMemo(() => {
    return (
      tempFilters.area !== '' &&
      tempFilters.type !== '' &&
      tempFilters.cost !== ''
    );
  }, [tempFilters]);

  // Get missing filter names for dynamic error message
  const getMissingRequiredFilters = useMemo(() => {
    const missing = [];
    if (tempFilters.area === '') missing.push('Area');
    if (tempFilters.type === '') missing.push('Type');
    if (tempFilters.cost === '') missing.push('Cost');
    return missing;
  }, [tempFilters]);

  // Apply filters when Go button is clicked
  const applyFilters = useCallback(() => {
    const finalFilters = { ...tempFilters, search: searchInput };

    // Check if required filters are selected
    if (!hasRequiredTempFilters) {
      setShowValidationError(true);
      return;
    }

    setShowValidationError(false);
    setAppliedFilters(finalFilters);
    updateURL(finalFilters);
    onFiltersChange(finalFilters);
  }, [
    tempFilters,
    searchInput,
    hasRequiredTempFilters,
    updateURL,
    onFiltersChange,
  ]);

  // Update temporary filters (not applied until Go is clicked)
  const updateTempFilters = useCallback(
    (newFilters: Partial<RestaurantFilterState>) => {
      setShowValidationError(false); // Clear validation error when filters change
      setTempFilters((prev) => {
        const updated = { ...prev, ...newFilters };
        // Only update if there's an actual change
        if (JSON.stringify(updated) !== JSON.stringify(prev)) {
          return updated;
        }
        return prev;
      });
    },
    []
  );

  // Sync filters when URL changes (browser back/forward)
  useEffect(() => {
    const urlFilters = getInitialFilters();
    setAppliedFilters(urlFilters);
    setTempFilters(urlFilters);
    setSearchInput(urlFilters.search);
    onFiltersChange(urlFilters);
  }, [searchParams]);

  const clearFilters = useCallback(() => {
    const clearedFilters: RestaurantFilterState = {
      area: '',
      type: '',
      cost: '',
      rating: 'all',
      search: '',
      distance: '',
      startingPoint: 'all',
    };
    setAppliedFilters(clearedFilters);
    setTempFilters(clearedFilters);
    setSearchInput('');
    updateURL(clearedFilters);
    onFiltersChange(clearedFilters);
  }, [updateURL, onFiltersChange]);

  const hasActiveFilters =
    (appliedFilters.area && appliedFilters.area !== '') ||
    (appliedFilters.type && appliedFilters.type !== '') ||
    (appliedFilters.cost && appliedFilters.cost !== '') ||
    (appliedFilters.rating && appliedFilters.rating !== 'all') ||
    (appliedFilters.distance && appliedFilters.distance !== '') ||
    (appliedFilters.startingPoint && appliedFilters.startingPoint !== 'all') ||
    (appliedFilters.search && appliedFilters.search !== '');

  const hasUnappliedChanges = useMemo(
    () =>
      tempFilters.area !== appliedFilters.area ||
      tempFilters.type !== appliedFilters.type ||
      tempFilters.cost !== appliedFilters.cost ||
      tempFilters.rating !== appliedFilters.rating ||
      tempFilters.distance !== appliedFilters.distance ||
      tempFilters.startingPoint !== appliedFilters.startingPoint ||
      searchInput !== appliedFilters.search,
    [tempFilters, appliedFilters, searchInput]
  );

  const FilterContent = useMemo(
    () => (
      <>
        {/* Search Bar */}
        <div className='relative mb-4'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
          <Input
            key='restaurant-search-input'
            placeholder='Search restaurants...'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className='pl-10'
          />
        </div>

        {/* Filter Row */}
        <div className='grid grid-cols-1 md:grid-cols-5 gap-4 mb-4'>
          {/* Location Filter */}
          <div>
            <Label className='text-sm font-medium text-gray-700 mb-2 block'>
              Area
            </Label>
            <Select
              value={tempFilters.area}
              onValueChange={(value) => updateTempFilters({ area: value })}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select area' />
              </SelectTrigger>
              <SelectContent>
                {locationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type Filter */}
          <div>
            <Label className='text-sm font-medium text-gray-700 mb-2 block'>
              Type
            </Label>
            <Select
              value={tempFilters.type}
              onValueChange={(value) => updateTempFilters({ type: value })}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select type' />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cost Filter */}
          <div>
            <Label className='text-sm font-medium text-gray-700 mb-2 block'>
              Cost
            </Label>
            <Select
              value={tempFilters.cost}
              onValueChange={(value) => updateTempFilters({ cost: value })}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select cost range' />
              </SelectTrigger>
              <SelectContent>
                {costOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Distance Filter */}
          <div>
            <Label className='text-sm font-medium text-gray-700 mb-2 block'>
              Distance
            </Label>
            <Select
              value={tempFilters.distance}
              onValueChange={(value) => updateTempFilters({ distance: value })}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select distance' />
              </SelectTrigger>
              <SelectContent>
                {distanceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className='flex items-end space-x-2'>
            <Button
              onClick={applyFilters}
              className='bg-vineyard-500 hover:bg-vineyard-600 flex-1'
            >
              Go
            </Button>
            <Button
              variant='outline'
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className='flex-1'
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Validation Error */}
        {showValidationError && (
          <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
            <p className='text-sm text-red-600 font-medium'>
              Please select the following filters before searching:{' '}
              {getMissingRequiredFilters.join(', ')}
            </p>
          </div>
        )}

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className='flex flex-wrap gap-2 mb-4'>
            {appliedFilters.area && appliedFilters.area !== '' && (
              <Badge
                variant='secondary'
                className='bg-vineyard-100 text-vineyard-800'
              >
                Area:{' '}
                {
                  locationOptions.find(
                    (opt) => opt.value === appliedFilters.area
                  )?.label
                }
                <X
                  className='ml-1 h-3 w-3 cursor-pointer'
                  onClick={() => {
                    const clearedFilters = { ...appliedFilters, area: '' };
                    setAppliedFilters(clearedFilters);
                    setTempFilters(clearedFilters);
                    updateURL(clearedFilters);
                    onFiltersChange(clearedFilters);
                  }}
                />
              </Badge>
            )}
            {appliedFilters.type && appliedFilters.type !== '' && (
              <Badge
                variant='secondary'
                className='bg-vineyard-100 text-vineyard-800'
              >
                Type:{' '}
                {
                  typeOptions.find((opt) => opt.value === appliedFilters.type)
                    ?.label
                }
                <X
                  className='ml-1 h-3 w-3 cursor-pointer'
                  onClick={() => {
                    const clearedFilters = { ...appliedFilters, type: '' };
                    setAppliedFilters(clearedFilters);
                    setTempFilters(clearedFilters);
                    updateURL(clearedFilters);
                    onFiltersChange(clearedFilters);
                  }}
                />
              </Badge>
            )}
            {appliedFilters.cost && appliedFilters.cost !== '' && (
              <Badge
                variant='secondary'
                className='bg-vineyard-100 text-vineyard-800'
              >
                Cost:{' '}
                {
                  costOptions.find((opt) => opt.value === appliedFilters.cost)
                    ?.label
                }
                <X
                  className='ml-1 h-3 w-3 cursor-pointer'
                  onClick={() => {
                    const clearedFilters = { ...appliedFilters, cost: '' };
                    setAppliedFilters(clearedFilters);
                    setTempFilters(clearedFilters);
                    updateURL(clearedFilters);
                    onFiltersChange(clearedFilters);
                  }}
                />
              </Badge>
            )}
            {appliedFilters.distance && appliedFilters.distance !== '' && (
              <Badge
                variant='secondary'
                className='bg-vineyard-100 text-vineyard-800'
              >
                Distance:{' '}
                {
                  distanceOptions.find(
                    (opt) => opt.value === appliedFilters.distance
                  )?.label
                }
                <X
                  className='ml-1 h-3 w-3 cursor-pointer'
                  onClick={() => {
                    const clearedFilters = {
                      ...appliedFilters,
                      distance: '',
                    };
                    setAppliedFilters(clearedFilters);
                    setTempFilters(clearedFilters);
                    updateURL(clearedFilters);
                    onFiltersChange(clearedFilters);
                  }}
                />
              </Badge>
            )}
            {appliedFilters.search && appliedFilters.search !== '' && (
              <Badge
                variant='secondary'
                className='bg-vineyard-100 text-vineyard-800'
              >
                Search: "{appliedFilters.search}"
                <X
                  className='ml-1 h-3 w-3 cursor-pointer'
                  onClick={() => {
                    const clearedFilters = {
                      ...appliedFilters,
                      search: '',
                    };
                    setAppliedFilters(clearedFilters);
                    setTempFilters(clearedFilters);
                    setSearchInput('');
                    updateURL(clearedFilters);
                    onFiltersChange(clearedFilters);
                  }}
                />
              </Badge>
            )}
          </div>
        )}
      </>
    ),
    [
      searchInput,
      tempFilters,
      appliedFilters,
      hasActiveFilters,
      hasUnappliedChanges,
      applyFilters,
      clearFilters,
      updateTempFilters,
      typeOptions,
      costOptions,
      distanceOptions,
      locationOptions,
      startingPointOptions,
    ]
  );

  return (
    <div className={cn('w-full', className)}>
      {/* Mobile Filter Toggle */}
      <div className='md:hidden mb-4'>
        <Button
          variant='outline'
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className='w-full'
        >
          <Filter className='mr-2 h-4 w-4' />
          Filters{' '}
          {hasActiveFilters &&
            `(${
              [
                appliedFilters.area !== '' ? appliedFilters.area : null,
                appliedFilters.type !== '' ? appliedFilters.type : null,
                appliedFilters.cost !== '' ? appliedFilters.cost : null,
                appliedFilters.distance !== '' ? appliedFilters.distance : null,
                appliedFilters.startingPoint !== 'all'
                  ? appliedFilters.startingPoint
                  : null,
                appliedFilters.search !== '' ? appliedFilters.search : null,
              ].filter(Boolean).length
            })`}
        </Button>
      </div>

      {/* Desktop Filters - Always Visible */}
      <div className='hidden md:block'>
        <Card className='p-6'>{FilterContent}</Card>
      </div>

      {/* Mobile Filters - Collapsible */}
      {showMobileFilters && (
        <div className='md:hidden mb-4'>
          <Card className='p-4'>{FilterContent}</Card>
        </div>
      )}
    </div>
  );
}
