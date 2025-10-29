'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { VineyardFilters } from '@/components/ui/vineyard-filters';
import { VineyardCard } from '@/components/ui/vineyard-card';
import { PaginationCustom } from '@/components/ui/pagination-custom';
import { Button } from '@/components/ui/button';
import { NavigationWarning } from '@/components/ui/navigation-warning';
import VineyardTourLayout from '@/components/layouts/vineyard-tour-layout';
import { Grape } from 'lucide-react';
import { Vineyard, Offer, FilterState } from '@/lib/types-vineyard';
import { useTrip } from '@/lib/context/trip-context';
import { useRouter } from 'next/navigation';

const ITEMS_PER_PAGE = 12;

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = parseInt(searchParams.get('page') || '1');
  const { trip, addVineyard, removeVineyard, hasUnsavedChanges } = useTrip();
  const MAX_VINEYARDS = 10;

  const [vineyards, setVineyards] = useState<Vineyard[]>([]);
  const [additionalVineyards, setAdditionalVineyards] = useState<Vineyard[]>(
    []
  );
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    area: '',
    type: '',
    cost: '',
    experience: [],
    search: '',
  });

  // Function to fetch vineyards from API with filters
  const fetchVineyards = useCallback(async (filterParams: FilterState) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // Map frontend filter names to API parameter names
      if (filterParams.area && filterParams.area !== '') {
        params.set('region', filterParams.area);
      }
      if (filterParams.type && filterParams.type !== '') {
        params.set('type', filterParams.type);
      }
      if (filterParams.search && filterParams.search !== '') {
        params.set('search', filterParams.search);
      }
      if (filterParams.experience && filterParams.experience.length > 0) {
        params.set('experience', filterParams.experience.join(','));
      }
      if (filterParams.cost && filterParams.cost !== '') {
        // Convert cost filter to minCost/maxCost
        switch (filterParams.cost) {
          case 'under-25':
            params.set('maxCost', '25');
            break;
          case '25-40':
            params.set('minCost', '25');
            params.set('maxCost', '40');
            break;
          case '40-70':
            params.set('minCost', '40');
            params.set('maxCost', '70');
            break;
          case '70+':
            params.set('minCost', '70');
            break;
        }
      }

      const response = await fetch(`/api/vineyards?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch vineyards');
      }

      const result = await response.json();
      console.log('🚀 ~ ExplorePage ~ result:', result);

      // Handle new response structure
      if (result.data.vineyards) {
        setVineyards(result.data.vineyards || []);
        setAdditionalVineyards(result.data.additionalRecommendations || []);
      } else {
        // Fallback for old API response format
        setVineyards(result.data || []);
        setAdditionalVineyards([]);
      }
    } catch (error) {
      console.error('Error fetching vineyards:', error);
      setVineyards([]);
      setAdditionalVineyards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to fetch offers
  const fetchOffers = useCallback(async () => {
    try {
      const response = await fetch('/api/offers');
      if (!response.ok) {
        throw new Error('Failed to fetch offers');
      }

      const result = await response.json();
      setOffers(result.data || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
      setOffers([]);
    }
  }, []);

  // Initialize filters from URL on component mount
  useEffect(() => {
    const urlFilters: FilterState = {
      area: searchParams.get('area') || '',
      type: searchParams.get('type') || '',
      cost: searchParams.get('cost') || '',
      experience: searchParams.get('experience')?.split(',') || [],
      search: searchParams.get('search') || '',
    };
    setFilters(urlFilters);

    // Fetch offers once on mount
    fetchOffers();

    // Only fetch vineyards if we have required filters
    if (
      urlFilters.area &&
      urlFilters.type &&
      urlFilters.cost &&
      urlFilters.experience.length > 0
    ) {
      fetchVineyards(urlFilters);
    }
  }, [searchParams, fetchVineyards, fetchOffers]);

  // Handle filter changes from VineyardFilters component
  const handleFiltersChange = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);
      fetchVineyards(newFilters);
    },
    [fetchVineyards]
  );

  // Check if user has selected all required filters or has a search query
  const hasValidFilters = useMemo(() => {
    // Allow search without requiring other filters
    if (filters.search && filters.search.trim() !== '') {
      return true;
    }
    // Otherwise, require all other filters
    return (
      filters.area !== '' &&
      filters.type !== '' &&
      filters.cost !== '' &&
      filters.experience.length > 0
    );
  }, [filters]);

  // Use vineyards directly from API (already filtered on server)
  const filteredVineyards = hasValidFilters ? vineyards : [];

  // Combine selected vineyards with search results, showing selected ones first
  const combinedVineyards = useMemo(() => {
    if (!hasValidFilters && trip.vineyards.length === 0) {
      return [];
    }

    const selectedVineyardIds = new Set(
      trip.vineyards.map((tv) => tv.vineyard.vineyard_id)
    );
    const selectedVineyards = trip.vineyards.map((tv) => ({
      ...tv.vineyard,
      isSelected: true,
    }));

    // Get non-selected vineyards from search results
    const nonSelectedVineyards = filteredVineyards
      .filter((v) => !selectedVineyardIds.has(v.vineyard_id))
      .map((v) => ({ ...v, isSelected: false }));

    return [...selectedVineyards, ...nonSelectedVineyards];
  }, [filteredVineyards, trip.vineyards, hasValidFilters]);

  // Pagination - apply to combined results
  const totalPages = Math.ceil(combinedVineyards.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedVineyards = combinedVineyards.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Get offers for a vineyard
  const getVineyardOffers = (vineyardId: string) => {
    return offers.filter((offer) => offer.vineyard_id === vineyardId);
  };

  // Trip management
  const handleAddToTrip = async (vineyardId: string, offerId?: string) => {
    // Check both main vineyards and additional vineyards
    let vineyard = vineyards.find((v) => v.vineyard_id === vineyardId);
    if (!vineyard) {
      vineyard = additionalVineyards.find((v) => v.vineyard_id === vineyardId);
    }

    const offer = offerId
      ? offers.find((o) => o.vineyard_id === vineyardId)
      : undefined;

    if (vineyard) {
      const success = await addVineyard(vineyard, offer);
      if (!success) {
        alert(
          'You can only add up to 10 vineyards or this vineyard is already added.'
        );
      }
    }
  };

  const handleRemoveFromTrip = (vineyardId: string) => {
    removeVineyard(vineyardId);
  };

  // Check if vineyard is in trip
  const isVineyardInTrip = (vineyardId: string) => {
    return trip.vineyards.some((v) => v.vineyard.vineyard_id === vineyardId);
  };

  console.log(
    '🚀 ~ ExplorePage ~ filteredVineyards:',
    filteredVineyards,
    trip.vineyards
  );
  const hasVineyards = trip.vineyards.length > 0;

  return (
    <VineyardTourLayout currentStep='vineyard'>
      <NavigationWarning />
      {/* Filters */}
      <div className='container mx-auto px-4 mt-6'>
        <h2 className='text-xl md:text-2xl  font-semibold md:font-bold text-gray-900 mb-4'>
          Explore
        </h2>
        <VineyardFilters onFiltersChange={handleFiltersChange} />
      </div>

      {/* Results Header */}
      {(combinedVineyards.length > 0 || trip.vineyards.length > 0) && (
        <div className='container mx-auto px-4 py-4' id='vineyards'>
          <div className='mb-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-2xl font-semibold md:font-bold text-gray-900'>
                  Vineyards
                </h2>
                {/* <p className='text-gray-600 mt-1'>
                  {trip.vineyards.length > 0 && (
                    <span className='text-vineyard-600 font-medium'>
                      {trip.vineyards.length} selected
                    </span>
                  )}
                  {trip.vineyards.length > 0 &&
                    filteredVineyards.length > 0 && (
                      <span className='text-gray-400 mx-2'>•</span>
                    )}
                  {filteredVineyards.length > 0 && (
                    <span>{filteredVineyards.length} available</span>
                  )}
                  {trip.vineyards.length === 0 &&
                    filteredVineyards.length === 0 && (
                      <span>No vineyards found</span>
                    )}
                </p> */}
              </div>
            </div>
          </div>

          {/* Vineyard Grid */}
          {loading ? (
            <div className='text-center py-12'>
              <p className='text-gray-600'>Loading vineyards...</p>
            </div>
          ) : paginatedVineyards.length > 0 ? (
            <>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
                {paginatedVineyards.map((vineyard) => {
                  const isSelected = vineyard.isSelected;
                  return (
                    <div key={vineyard.vineyard_id} className='relative'>
                      {isSelected && (
                        <div className='absolute -top-2 -left-2 z-10'>
                          <div className='bg-vineyard-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm'>
                            Selected
                          </div>
                        </div>
                      )}
                      <VineyardCard
                        vineyard={vineyard}
                        offers={getVineyardOffers(vineyard.vineyard_id)}
                        onAddToTrip={handleAddToTrip}
                        onRemoveFromTrip={handleRemoveFromTrip}
                        isInTrip={isSelected}
                        className={
                          isSelected
                            ? 'border-2 border-vineyard-200 bg-gradient-to-br from-vineyard-50 to-white'
                            : ''
                        }
                      />
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <PaginationCustom
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl='/explore'
                className='mb-8'
              />
            </>
          ) : (
            <div className='text-center py-12'>
              {!hasValidFilters && trip.vineyards.length === 0 ? (
                <></>
              ) : (
                <>
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    No vineyards found
                  </h3>
                  <p className='text-gray-600 mb-4'>
                    Try adjusting your filters to see more results.
                  </p>
                  <Button
                    variant='outline'
                    onClick={() => {
                      const clearedFilters = {
                        area: '',
                        type: '',
                        cost: '',
                        experience: [],
                        search: '',
                      };
                      setFilters(clearedFilters);
                      setVineyards([]);
                    }}
                  >
                    Clear All Filters
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Additional Recommendations Section */}
      {additionalVineyards.length > 0 && filteredVineyards.length < 3 && (
        <div className='container mx-auto px-4 py-8' id='additional-vineyards'>
          <div className='mb-6'>
            <p className=''>
              Here are {additionalVineyards.length} additional options which are
              close to your request
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
            {additionalVineyards.map((vineyard) => {
              const isSelected = trip.vineyards.some(
                (v) => v.vineyard.vineyard_id === vineyard.vineyard_id
              );
              return (
                <div
                  key={vineyard.vineyard_id}
                  className='relative opacity-90 hover:opacity-100 transition-opacity'
                >
                  {isSelected && (
                    <div className='absolute -top-2 -left-2 z-10'>
                      <div className='bg-vineyard-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm'>
                        Selected
                      </div>
                    </div>
                  )}
                  <VineyardCard
                    vineyard={vineyard}
                    offers={getVineyardOffers(vineyard.vineyard_id)}
                    onAddToTrip={handleAddToTrip}
                    onRemoveFromTrip={handleRemoveFromTrip}
                    isInTrip={isSelected}
                    className={
                      isSelected
                        ? 'border-2 border-vineyard-200 bg-gradient-to-br from-vineyard-50 to-white'
                        : 'border-gray-300'
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {hasVineyards && (
        <div className='container mx-auto px-4 flex justify-end'>
          <Button
            className='bg-vineyard-500 hover:bg-vineyard-600'
            onClick={() => router.push('/explore/lunch')}
          >
            Next: Lunch
          </Button>
        </div>
      )}
    </VineyardTourLayout>
  );
}
