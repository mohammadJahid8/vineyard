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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter } from 'lucide-react';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FilterState } from '@/lib/types-vineyard';

interface VineyardFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  className?: string;
}

const areaOptions = [
  { value: 'all', label: 'All Areas' },
  { value: '1. Reims City (by foot)', label: 'Reims City' },
  { value: '2. Reims Region (by car)', label: 'Reims Region' },
  { value: '3. Epernay City (by foot)', label: 'Epernay City' },
  { value: '4. Epernay Region (by car)', label: 'Epernay Region' },
];

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'International', label: 'International' },
  { value: 'Boutique', label: 'Boutique' },
  { value: 'Grower', label: 'Grower' },
];

const costOptions = [
  { value: 'all', label: 'All Costs' },
  { value: 'under-25', label: 'Under €25' },
  { value: '25-50', label: '€25 - €50' },
  { value: '50-100', label: '€50 - €100' },
  { value: 'over-100', label: 'Over €100' },
];

const experienceOptions = [
  { id: 'tasting_only', label: 'Tasting Only' },
  { id: 'tour_and_tasting', label: 'Tour & Tasting' },
  { id: 'pairing_and_lunch', label: 'Pairing & Lunch' },
  { id: 'vine_experience', label: 'Vine Experience' },
  { id: 'masterclass_workshop', label: 'Masterclass/Workshop' },
];

export function VineyardFilters({
  onFiltersChange,
  className,
}: VineyardFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize filters from URL parameters
  const getInitialFilters = (): FilterState => {
    const experienceParam = searchParams.get('experience');
    return {
      area: searchParams.get('area') || 'all',
      type: searchParams.get('type') || 'all',
      cost: searchParams.get('cost') || 'all',
      experience: experienceParam ? experienceParam.split(',') : [],
      search: searchParams.get('search') || '',
    };
  };

  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(getInitialFilters);
  const [tempFilters, setTempFilters] =
    useState<FilterState>(getInitialFilters);
  const [searchInput, setSearchInput] = useState(getInitialFilters().search);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const filtersRef = useRef(appliedFilters);

  // Keep ref in sync with applied filters
  useEffect(() => {
    filtersRef.current = appliedFilters;
  }, [appliedFilters]);

  // Update URL when filters change
  const updateURL = (newFilters: FilterState) => {
    const params = new URLSearchParams();

    // Only add non-default values to URL
    if (newFilters.area !== 'all') params.set('area', newFilters.area);
    if (newFilters.type !== 'all') params.set('type', newFilters.type);
    if (newFilters.cost !== 'all') params.set('cost', newFilters.cost);
    if (newFilters.experience.length > 0)
      params.set('experience', newFilters.experience.join(','));
    if (newFilters.search) params.set('search', newFilters.search);

    const paramString = params.toString();
    const newUrl = paramString ? `?${paramString}` : window.location.pathname;

    router.replace(newUrl, { scroll: false });
  };

  // Apply filters when Go button is clicked
  const applyFilters = useCallback(() => {
    const finalFilters = { ...tempFilters, search: searchInput };
    setAppliedFilters(finalFilters);
    updateURL(finalFilters);
    onFiltersChange(finalFilters);
  }, [tempFilters, searchInput, updateURL, onFiltersChange]);

  // Update temporary filters (not applied until Go is clicked)
  const updateTempFilters = useCallback((newFilters: Partial<FilterState>) => {
    setTempFilters((prev) => {
      const updated = { ...prev, ...newFilters };
      // Only update if there's an actual change
      if (JSON.stringify(updated) !== JSON.stringify(prev)) {
        return updated;
      }
      return prev;
    });
  }, []);

  // Sync filters when URL changes (browser back/forward)
  useEffect(() => {
    const urlFilters = getInitialFilters();
    setAppliedFilters(urlFilters);
    setTempFilters(urlFilters);
    setSearchInput(urlFilters.search);
    onFiltersChange(urlFilters);
  }, [searchParams]);

  const clearFilters = useCallback(() => {
    const clearedFilters: FilterState = {
      area: 'all',
      type: 'all',
      cost: 'all',
      experience: [],
      search: '',
    };
    setAppliedFilters(clearedFilters);
    setTempFilters(clearedFilters);
    setSearchInput('');
    updateURL(clearedFilters);
    onFiltersChange(clearedFilters);
  }, [updateURL, onFiltersChange]);

  const hasActiveFilters =
    (appliedFilters.area && appliedFilters.area !== 'all') ||
    (appliedFilters.type && appliedFilters.type !== 'all') ||
    (appliedFilters.cost && appliedFilters.cost !== 'all') ||
    appliedFilters.experience.length > 0 ||
    (appliedFilters.search && appliedFilters.search !== '');

  const hasUnappliedChanges = useMemo(
    () =>
      tempFilters.area !== appliedFilters.area ||
      tempFilters.type !== appliedFilters.type ||
      tempFilters.cost !== appliedFilters.cost ||
      searchInput !== appliedFilters.search ||
      JSON.stringify(tempFilters.experience.sort()) !==
        JSON.stringify(appliedFilters.experience.sort()),
    [tempFilters, appliedFilters, searchInput]
  );

  const handleExperienceChange = (experienceId: string, checked: boolean) => {
    const newExperience = checked
      ? [...tempFilters.experience, experienceId]
      : tempFilters.experience.filter((id) => id !== experienceId);

    updateTempFilters({ experience: newExperience });
  };

  const FilterContent = useMemo(
    () => (
      <>
        {/* Search Bar */}
        <div className='relative mb-4'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
          <Input
            key='vineyard-search-input'
            placeholder='Search vineyards...'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className='pl-10'
          />
        </div>

        {/* Filter Row */}
        <div className='grid grid-cols-1 md:grid-cols-5 gap-4 mb-4'>
          {/* Area Filter */}
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
                {areaOptions.map((option) => (
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

          {/* Action Buttons */}
          <div className='flex items-end space-x-2 md:col-span-2'>
            <Button
              onClick={applyFilters}
              disabled={!hasUnappliedChanges}
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

        {/* Experience Checkboxes */}
        <div className='mb-4'>
          <Label className='text-sm font-medium text-gray-700 mb-3 block'>
            Experience Type
          </Label>
          <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
            {experienceOptions.map((option) => (
              <div key={option.id} className='flex items-center space-x-2'>
                <Checkbox
                  id={option.id}
                  checked={tempFilters.experience.includes(option.id)}
                  onCheckedChange={(checked) =>
                    handleExperienceChange(option.id, !!checked)
                  }
                />
                <Label
                  htmlFor={option.id}
                  className='text-xs font-normal leading-tight cursor-pointer'
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className='flex flex-wrap gap-2 mb-4'>
            {appliedFilters.area && appliedFilters.area !== 'all' && (
              <Badge
                variant='secondary'
                className='bg-vineyard-100 text-vineyard-800'
              >
                Area:{' '}
                {
                  areaOptions.find((opt) => opt.value === appliedFilters.area)
                    ?.label
                }
                <X
                  className='ml-1 h-3 w-3 cursor-pointer'
                  onClick={() => {
                    const clearedFilters = { ...appliedFilters, area: 'all' };
                    setAppliedFilters(clearedFilters);
                    setTempFilters(clearedFilters);
                    updateURL(clearedFilters);
                    onFiltersChange(clearedFilters);
                  }}
                />
              </Badge>
            )}
            {appliedFilters.type && appliedFilters.type !== 'all' && (
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
                    const clearedFilters = { ...appliedFilters, type: 'all' };
                    setAppliedFilters(clearedFilters);
                    setTempFilters(clearedFilters);
                    updateURL(clearedFilters);
                    onFiltersChange(clearedFilters);
                  }}
                />
              </Badge>
            )}
            {appliedFilters.cost && appliedFilters.cost !== 'all' && (
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
                    const clearedFilters = { ...appliedFilters, cost: 'all' };
                    setAppliedFilters(clearedFilters);
                    setTempFilters(clearedFilters);
                    updateURL(clearedFilters);
                    onFiltersChange(clearedFilters);
                  }}
                />
              </Badge>
            )}
            {appliedFilters.experience.map((exp) => (
              <Badge
                key={exp}
                variant='secondary'
                className='bg-vineyard-100 text-vineyard-800'
              >
                {experienceOptions.find((opt) => opt.id === exp)?.label}
                <X
                  className='ml-1 h-3 w-3 cursor-pointer'
                  onClick={() => {
                    const clearedFilters = {
                      ...appliedFilters,
                      experience: appliedFilters.experience.filter(
                        (id) => id !== exp
                      ),
                    };
                    setAppliedFilters(clearedFilters);
                    setTempFilters(clearedFilters);
                    updateURL(clearedFilters);
                    onFiltersChange(clearedFilters);
                  }}
                />
              </Badge>
            ))}
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
      handleExperienceChange,
      areaOptions,
      typeOptions,
      costOptions,
      experienceOptions,
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
                appliedFilters.area !== 'all' ? appliedFilters.area : null,
                appliedFilters.type !== 'all' ? appliedFilters.type : null,
                appliedFilters.cost !== 'all' ? appliedFilters.cost : null,
                appliedFilters.search !== '' ? appliedFilters.search : null,
                ...appliedFilters.experience,
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
