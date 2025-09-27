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
      setVineyards(result.data || []);
    } catch (error) {
      console.error('Error fetching vineyards:', error);
      setVineyards([]);
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

  // Check if user has selected all required filters
  const hasAllRequiredFilters = useMemo(() => {
    return (
      filters.area !== '' &&
      filters.type !== '' &&
      filters.cost !== '' &&
      filters.experience.length > 0
    );
  }, [filters]);

  // Use vineyards directly from API (already filtered on server)
  const filteredVineyards = hasAllRequiredFilters ? vineyards : [];

  // Pagination
  const totalPages = Math.ceil(filteredVineyards.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedVineyards = filteredVineyards.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Get offers for a vineyard
  const getVineyardOffers = (vineyardId: string) => {
    return offers.filter((offer) => offer.vineyard_id === vineyardId);
  };

  // Trip management
  const handleAddToTrip = async (vineyardId: string, offerId?: string) => {
    const vineyard = vineyards.find((v) => v.vineyard_id === vineyardId);
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

  const hasVineyards =
    filteredVineyards.length > 0 || trip.vineyards.length > 0;

  return (
    <VineyardTourLayout currentStep='vineyard'>
      <NavigationWarning />
      {/* Filters */}
      <div className='container mx-auto px-4 mt-6'>
        <h2 className='text-xl md:text-2xl  font-semibold md:font-bold text-gray-900 mb-4'>
          Explore
        </h2>
        <VineyardFilters onFiltersChange={handleFiltersChange} />

        {/* Selected Vineyards Display */}
        {trip.vineyards.length > 0 && (
          <div className='mt-10'>
            <h2 className='text-xl md:text-2xl  font-semibold md:font-bold text-gray-900 mb-4'>
              Selected Vineyards
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {trip.vineyards.map((tripVineyard, index) => (
                <VineyardCard
                  key={index}
                  vineyard={tripVineyard.vineyard}
                  offers={
                    tripVineyard.offer
                      ? [tripVineyard.offer]
                      : getVineyardOffers(tripVineyard.vineyard.vineyard_id)
                  }
                  onAddToTrip={handleAddToTrip}
                  onRemoveFromTrip={handleRemoveFromTrip}
                  isInTrip={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      {filteredVineyards.length > 0 && (
        <div className='container mx-auto px-4 py-6' id='vineyards'>
          <div className='mb-4'>
            <h2 className='text-2xl  font-semibold md:font-bold text-gray-900'>
              Vineyards
            </h2>
            <p className='text-gray-600 mt-1'>
              {filteredVineyards.length} found
            </p>
          </div>

          {/* Vineyard Grid */}
          {loading ? (
            <div className='text-center py-12'>
              <p className='text-gray-600'>Loading vineyards...</p>
            </div>
          ) : paginatedVineyards.length > 0 ? (
            <>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
                {paginatedVineyards.map((vineyard) => (
                  <VineyardCard
                    key={vineyard.vineyard_id}
                    vineyard={vineyard}
                    offers={getVineyardOffers(vineyard.vineyard_id)}
                    onAddToTrip={handleAddToTrip}
                    onRemoveFromTrip={handleRemoveFromTrip}
                    isInTrip={isVineyardInTrip(vineyard.vineyard_id)}
                  />
                ))}
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
              {!hasAllRequiredFilters ? (
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

          {/* Fixed Next Button - Bottom Right */}
        </div>
      )}

      {hasVineyards && (
        <div className='container mx-auto px-4 mt-4 flex justify-end'>
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
