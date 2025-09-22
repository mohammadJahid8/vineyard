'use client';

import { useState, useMemo, useCallback } from 'react';
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

interface ExplorePageProps {
  vineyards: Vineyard[];
  offers: Offer[];
}

export default function ExplorePage({ vineyards, offers }: ExplorePageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = parseInt(searchParams.get('page') || '1');
  const { trip, addVineyard, removeVineyard, hasUnsavedChanges } = useTrip();
  const MAX_VINEYARDS = 10;
  const [filters, setFilters] = useState<FilterState>({
    area: '',
    type: '',
    cost: '',
    experience: [],
    search: '',
  });

  // Handle filter changes from VineyardFilters component
  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  // Check if user has selected all required filters
  const hasAllRequiredFilters = useMemo(() => {
    return (
      filters.area !== '' &&
      filters.type !== '' &&
      filters.cost !== '' &&
      filters.experience.length > 0
    );
  }, [filters]);

  // Get missing filter names
  const getMissingFilters = useMemo(() => {
    const missing = [];
    if (filters.area === '') missing.push('Area');
    if (filters.type === '') missing.push('Type');
    if (filters.cost === '') missing.push('Cost');
    if (filters.experience.length === 0) missing.push('Experience Type');
    return missing;
  }, [filters]);

  // Filter vineyards
  const filteredVineyards = useMemo(() => {
    // Don't show any vineyards if all required filters are not selected
    if (!hasAllRequiredFilters) {
      return [];
    }

    return vineyards
      .filter((vineyard) => {
        // Search filter
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          const vineyardName = vineyard.vineyard?.toLowerCase() || '';
          const subRegion = vineyard.sub_region?.toLowerCase() || '';

          if (
            !vineyardName.includes(searchTerm) &&
            !subRegion.includes(searchTerm)
          ) {
            return false;
          }
        }

        // Area filter - use partial matching on sub_region
        if (filters.area && filters.area !== '') {
          const subRegion = vineyard.sub_region?.toLowerCase() || '';
          const filterArea = filters.area.toLowerCase();
          if (!subRegion.includes(filterArea)) {
            return false;
          }
        }

        // Type filter
        if (
          filters.type &&
          filters.type !== '' &&
          (vineyard.type || '') !== filters.type
        ) {
          return false;
        }

        // Cost filter
        if (filters.cost && filters.cost !== '') {
          const cost = vineyard.lowest_cost_per_adult;
          if (cost == null || cost === undefined) return false; // Skip items without cost data

          switch (filters.cost) {
            case 'under-25':
              if (cost >= 25) return false;
              break;
            case '25-40':
              if (cost < 25 || cost > 40) return false;
              break;
            case '40-70':
              if (cost < 40 || cost > 70) return false;
              break;
            case '70+':
              if (cost < 70) return false;
              break;
          }
        }

        // Experience filter
        if (filters.experience.length > 0) {
          const hasMatchingExperience = filters.experience.some((exp) => {
            switch (exp) {
              case 'tasting_only':
                return vineyard.tasting_only;
              case 'tour_and_tasting':
                return vineyard.tour_and_tasting;
              case 'pairing_and_lunch':
                return vineyard.pairing_and_lunch;
              case 'vine_experience':
                return vineyard.vine_experience;
              case 'masterclass_workshop':
                return vineyard.masterclass_workshop;
              default:
                return false;
            }
          });
          if (!hasMatchingExperience) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sort by Google rating (higher first)
        const ratingA = parseFloat(a.g?.toString() || '0') || 0;
        const ratingB = parseFloat(b.g?.toString() || '0') || 0;
        return ratingB - ratingA;
      })
      .slice(0, 10); // Limit to top 10 vineyards
  }, [vineyards, filters]);
  console.log({ filteredVineyards });

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

  console.log({ trip, paginatedVineyards });

  const hasVineyards =
    filteredVineyards.length > 0 || trip.vineyards.length > 0;

  return (
    <VineyardTourLayout currentStep='vineyard'>
      <NavigationWarning />
      {/* Filters */}
      <div className='container mx-auto px-4 mt-6'>
        <h2 className='text-xl md:text-2xl font-bold text-gray-900 mb-4'>
          Explore
        </h2>
        <VineyardFilters onFiltersChange={handleFiltersChange} />

        {/* Selected Vineyards Display */}
        {trip.vineyards.length > 0 && (
          <div className='mt-10'>
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>
              Selected Vineyards
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {trip.vineyards.map((tripVineyard) => (
                <VineyardCard
                  key={tripVineyard.vineyard.vineyard_id}
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
            <h2 className='text-2xl font-bold text-gray-900'>Vineyards</h2>
            <p className='text-gray-600 mt-1'>
              {filteredVineyards.length} found
            </p>
          </div>

          {/* Vineyard Grid */}
          {paginatedVineyards.length > 0 ? (
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
                    onClick={() =>
                      setFilters({
                        area: '',
                        type: '',
                        cost: '',
                        experience: [],
                        search: '',
                      })
                    }
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
