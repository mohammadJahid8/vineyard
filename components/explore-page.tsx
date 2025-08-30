'use client';

import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Stepper } from '@/components/ui/stepper';
import { VineyardFilters } from '@/components/ui/vineyard-filters';
import { VineyardCard } from '@/components/ui/vineyard-card';
import { PaginationCustom } from '@/components/ui/pagination-custom';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { Button } from '@/components/ui/button';
import { UserButton } from '@clerk/nextjs';
import { Grape } from 'lucide-react';
import { Vineyard, Offer, FilterState } from '@/lib/types-vineyard';
import { useTrip } from '@/lib/context/trip-context';
import { useRouter } from 'next/navigation';

const steps = [
  { id: 'vineyard', title: 'Vineyard', href: '/explore' },
  { id: 'lunch', title: 'Lunch', href: '/explore/lunch' },
  { id: 'daytrip', title: 'Day Trip', href: '/explore/day-trip' },
];

const ITEMS_PER_PAGE = 12;

interface ExplorePageProps {
  vineyards: Vineyard[];
  offers: Offer[];
}

export default function ExplorePage({ vineyards, offers }: ExplorePageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = parseInt(searchParams.get('page') || '1');
  const { trip, addVineyard, removeVineyard } = useTrip();
  const [filters, setFilters] = useState<FilterState>({
    area: 'all',
    type: 'all',
    cost: 'all',
    experience: [],
    search: '',
  });

  // Handle filter changes from VineyardFilters component
  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  // Filter vineyards
  const filteredVineyards = useMemo(() => {
    return vineyards.filter((vineyard) => {
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

      // Area filter
      if (
        filters.area &&
        filters.area !== 'all' &&
        (vineyard.sub_region || '') !== filters.area
      ) {
        return false;
      }

      // Type filter
      if (
        filters.type &&
        filters.type !== 'all' &&
        (vineyard.type || '') !== filters.type
      ) {
        return false;
      }

      // Cost filter
      if (filters.cost && filters.cost !== 'all') {
        const cost = vineyard.lowest_cost_per_adult;
        if (cost == null || cost === undefined) return false; // Skip items without cost data

        switch (filters.cost) {
          case 'under-25':
            if (cost >= 25) return false;
            break;
          case '25-50':
            if (cost < 25 || cost > 50) return false;
            break;
          case '50-100':
            if (cost < 50 || cost > 100) return false;
            break;
          case 'over-100':
            if (cost <= 100) return false;
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
    });
  }, [vineyards, filters]);

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
  const handleAddToTrip = (vineyardId: string, offerId?: string) => {
    const vineyard = vineyards.find((v) => v.vineyard_id === vineyardId);
    const offer = offerId
      ? offers.find((o) => o.vineyard_id === vineyardId)
      : undefined;

    if (vineyard) {
      addVineyard(vineyard, offer);
      // Navigate to day trip page to show the added vineyard
      router.push('/explore/day-trip');
    }
  };

  const handleRemoveFromTrip = (vineyardId: string) => {
    if (trip.vineyard?.vineyard.vineyard_id === vineyardId) {
      removeVineyard();
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-vineyard-50 via-white to-vineyard-100 pb-20'>
      {/* Header */}
      <header className='border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center space-x-3'>
              <Grape className='h-8 w-8 text-vineyard-500' />
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>
                  Vineyard Tour Planner
                </h1>
                <p className='text-sm text-gray-600'>
                  Plan your perfect wine tour experience
                </p>
              </div>
            </div>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10',
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Stepper */}
      <Stepper steps={steps} currentStep='vineyard' />

      {/* Filters */}
      <div className='container mx-auto px-4'>
        <VineyardFilters onFiltersChange={handleFiltersChange} />
      </div>

      {/* Results Header */}
      <div className='container mx-auto px-4 py-6'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>
              Explore Vineyards
            </h2>
            <p className='text-gray-600 mt-1'>
              {filteredVineyards.length} vineyard
              {filteredVineyards.length !== 1 ? 's' : ''} found
            </p>
          </div>
          {trip.vineyard && (
            <Button
              className='bg-vineyard-500 hover:bg-vineyard-600'
              onClick={() => router.push('/explore/day-trip')}
            >
              View Trip
            </Button>
          )}
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
                  isInTrip={
                    trip.vineyard?.vineyard.vineyard_id === vineyard.vineyard_id
                  }
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
            <div className='mx-auto mb-4 p-3 bg-gray-100 rounded-full w-fit'>
              <Grape className='h-8 w-8 text-gray-400' />
            </div>
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
                  area: 'all',
                  type: 'all',
                  cost: 'all',
                  experience: [],
                  search: '',
                })
              }
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
