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
import { MultiSelect } from '@/components/ui/multi-select';
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
  { value: 'reims city', label: 'Reims City' },
  { value: 'reims mountain', label: 'Reims Mountain' },
  { value: 'epernay city', label: 'Epernay City' },
  { value: 'near epernay', label: 'Near Epernay' },
  { value: 'marne valley', label: 'Marne Valley' },
  { value: 'côte des blancs', label: 'Côte des Blancs' },
  { value: 'further south', label: 'Further South' },
];

const typeOptions = [
  { value: 'International', label: 'International' },
  { value: 'Boutique', label: 'Boutique' },
  { value: 'Grower', label: 'Grower' },
];

const costOptions = [
  { value: 'under-25', label: 'Under €25' },
  { value: '25-40', label: '€25 - €40' },
  { value: '40-70', label: '€40 - €70' },
  { value: '70+', label: '€70+' },
];

const experienceOptions = [
  { value: 'tasting_only', label: 'Tasting Only' },
  { value: 'tour_and_tasting', label: 'Tour & Tasting' },
  { value: 'pairing_and_lunch', label: 'Pairing & Lunch' },
  { value: 'vine_experience', label: 'Vine Experience' },
  { value: 'masterclass_workshop', label: 'Masterclass/Workshop' },
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
      area: searchParams.get('area') || '',
      type: searchParams.get('type') || '',
      cost: searchParams.get('cost') || '',
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
  const [showValidationError, setShowValidationError] = useState(false);
  const filtersRef = useRef(appliedFilters);

  // Keep ref in sync with applied filters
  useEffect(() => {
    filtersRef.current = appliedFilters;
  }, [appliedFilters]);

  // Update URL when filters change
  const updateURL = (newFilters: FilterState) => {
    const params = new URLSearchParams();

    // Only add non-empty values to URL
    if (newFilters.area !== '') params.set('area', newFilters.area);
    if (newFilters.type !== '') params.set('type', newFilters.type);
    if (newFilters.cost !== '') params.set('cost', newFilters.cost);
    if (newFilters.experience.length > 0)
      params.set('experience', newFilters.experience.join(','));
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
      tempFilters.cost !== '' &&
      tempFilters.experience.length > 0
    );
  }, [tempFilters]);

  // Get missing filter names for dynamic error message
  const getMissingRequiredFilters = useMemo(() => {
    const missing = [];
    if (tempFilters.area === '') missing.push('Area');
    if (tempFilters.type === '') missing.push('Type');
    if (tempFilters.cost === '') missing.push('Cost');
    if (tempFilters.experience.length === 0) missing.push('Experience Type');
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
    window.scrollTo({
      top: document.getElementById('vineyards')?.offsetTop,
      behavior: 'smooth',
    });
  }, [
    tempFilters,
    searchInput,
    hasRequiredTempFilters,
    updateURL,
    onFiltersChange,
  ]);

  // Update temporary filters (not applied until Go is clicked)
  const updateTempFilters = useCallback((newFilters: Partial<FilterState>) => {
    setShowValidationError(false); // Clear validation error when filters change
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
      area: '',
      type: '',
      cost: '',
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
    (appliedFilters.area && appliedFilters.area !== '') ||
    (appliedFilters.type && appliedFilters.type !== '') ||
    (appliedFilters.cost && appliedFilters.cost !== '') ||
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

  const handleExperienceChange = (selectedExperience: string[]) => {
    updateTempFilters({ experience: selectedExperience });
  };

  const FilterContent = useMemo(
    () => (
      <>
        {/* Filter Row */}
        <div className='grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 mb-4'>
          {/* Area Filter */}
          <div className='md:col-span-2'>
            <Label className='md:text-xl font-medium text-black mb-2 block'>
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
          <div className='md:col-span-2'>
            <Label className='md:text-xl font-medium text-black mb-2 block'>
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
          <div className='md:col-span-2'>
            <Label className='md:text-xl font-medium text-black mb-2 block'>
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

          {/* Experience Filter */}
          <div className='md:col-span-2'>
            <Label className='md:text-xl font-medium text-black mb-2 block'>
              Experience Type
            </Label>
            <MultiSelect
              options={experienceOptions}
              selected={tempFilters.experience}
              onChange={handleExperienceChange}
              placeholder='Select experiences...'
            />
          </div>

          {/* Search Filter */}
          <div className='md:col-span-2'>
            <Label className='md:text-xl font-medium text-black mb-2 block'>
              Search
            </Label>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
              <Input
                key='vineyard-search-input'
                placeholder='Search vineyards...'
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className='pl-10'
              />
            </div>
          </div>
          {/* Action Buttons */}
          <div className='flex items-end gap-2 md:col-span-2'>
            <Button
              onClick={applyFilters}
              className='bg-vineyard-500 hover:bg-vineyard-600 h-9 px-3 w-full'
            >
              Go
            </Button>
            <Button
              variant='outline'
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className='h-9 px-3 w-full'
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Validation Error */}
        {showValidationError && (
          <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
            <p className='md:text-xl text-red-600 font-medium'>
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
                  areaOptions.find((opt) => opt.value === appliedFilters.area)
                    ?.label
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
            {appliedFilters.experience.map((exp) => (
              <Badge
                key={exp}
                variant='secondary'
                className='bg-vineyard-100 text-vineyard-800'
              >
                {experienceOptions.find((opt) => opt.value === exp)?.label}
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
                appliedFilters.area !== '' ? appliedFilters.area : null,
                appliedFilters.type !== '' ? appliedFilters.type : null,
                appliedFilters.cost !== '' ? appliedFilters.cost : null,
                appliedFilters.search !== '' ? appliedFilters.search : null,
                ...appliedFilters.experience,
              ].filter(Boolean).length
            })`}
        </Button>
      </div>

      {/* Desktop Filters - Always Visible */}
      <div className='hidden md:block'>
        <Card className='p-6 bg-gradient-to-br from-green-100 via-emerald-50 to-teal-50 border border-green-200 shadow-md'>
          {FilterContent}
        </Card>
      </div>

      {/* Mobile Filters - Collapsible */}
      {showMobileFilters && (
        <div className='md:hidden mb-4'>
          <Card className='p-4 bg-gradient-to-br from-green-100 via-emerald-50 to-teal-50 border border-green-200 shadow-md'>
            {FilterContent}
          </Card>
        </div>
      )}
    </div>
  );
}
