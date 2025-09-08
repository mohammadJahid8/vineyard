'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { RestaurantFilters } from '@/components/ui/restaurant-filters';
import { RestaurantCard } from '@/components/ui/restaurant-card';
import { PaginationCustom } from '@/components/ui/pagination-custom';
import { Button } from '@/components/ui/button';
import { NavigationWarning } from '@/components/ui/navigation-warning';
import VineyardTourLayout from '@/components/layouts/vineyard-tour-layout';
import { Utensils } from 'lucide-react';
import { Restaurant, RestaurantFilterState } from '@/lib/types-vineyard';
import { useTrip } from '@/lib/context/trip-context';
import { useRouter } from 'next/navigation';

const ITEMS_PER_PAGE = 12;

interface LunchPageProps {
  restaurants: Restaurant[];
}

export default function LunchPage({ restaurants }: LunchPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = parseInt(searchParams.get('page') || '1');
  const { trip, addRestaurant, removeRestaurant, hasUnsavedChanges } =
    useTrip();
  const [filters, setFilters] = useState<RestaurantFilterState>({
    area: 'all',
    type: 'all',
    cost: 'all',
    rating: 'all',
    search: '',
    distance: 'all',
    startingPoint: 'all',
  });

  // Handle filter changes from RestaurantFilters component
  const handleFiltersChange = useCallback(
    (newFilters: RestaurantFilterState) => {
      setFilters(newFilters);
    },
    []
  );

  // Check if user has selected all required filters
  const hasAllRequiredFilters = useMemo(() => {
    return filters.area !== '' && filters.type !== '' && filters.cost !== '';
  }, [filters]);

  // Get missing filter names
  const getMissingFilters = useMemo(() => {
    const missing = [];
    if (filters.area === '') missing.push('Area');
    if (filters.type === '') missing.push('Type');
    if (filters.cost === '') missing.push('Cost');
    return missing;
  }, [filters]);

  // Filter restaurants
  const filteredRestaurants = useMemo(() => {
    // Don't show any restaurants if all required filters are not selected
    if (!hasAllRequiredFilters) {
      return [];
    }

    return restaurants
      .filter((restaurant) => {
        // Search filter
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          const restaurantName = restaurant.restaurants?.toLowerCase() || '';
          const subRegion = restaurant.sub_region?.toLowerCase() || '';
          const type = restaurant.actual_type?.toLowerCase() || '';

          if (
            !restaurantName.includes(searchTerm) &&
            !subRegion.includes(searchTerm) &&
            !type.includes(searchTerm)
          ) {
            return false;
          }
        }

        // Area filter - use partial matching on sub_region
        if (filters.area && filters.area !== '') {
          const subRegion = restaurant.sub_region?.toLowerCase() || '';
          const filterArea = filters.area.toLowerCase();
          if (!subRegion.includes(filterArea)) {
            return false;
          }
        }

        // Type filter
        if (
          filters.type &&
          filters.type !== '' &&
          (restaurant.actual_type || '') !== filters.type
        ) {
          return false;
        }

        // Cost filter
        if (filters.cost && filters.cost !== '') {
          const cost = restaurant.avg_est_lunch_cost;
          if (cost == null || cost === undefined) return false;

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

        // Rating filter (removed since not in the new design)
        if (filters.rating && filters.rating !== 'all') {
          const rating = restaurant.g_rating;
          if (rating == null || rating === undefined) return false;

          switch (filters.rating) {
            case '4-plus':
              if (rating < 4.0) return false;
              break;
            case '4.5-plus':
              if (rating < 4.5) return false;
              break;
            case '3.5-plus':
              if (rating < 3.5) return false;
              break;
          }
        }

        // Distance filter (placeholder logic - would need actual distance calculation)
        if (filters.distance && filters.distance !== 'all') {
          // This would require implementing actual distance calculation
          // For now, we'll just pass through all restaurants
        }

        // Starting Point filter (placeholder logic)
        if (filters.startingPoint && filters.startingPoint !== 'all') {
          // This would require context of the user's current location or vineyard selection
          // For now, we'll just pass through all restaurants
        }

        return true;
      })
      .sort((a, b) => {
        // Sort by Google rating (higher first)
        const ratingA =
          typeof a.g_rating === 'string'
            ? parseFloat(a.g_rating)
            : a.g_rating || 0;
        const ratingB =
          typeof b.g_rating === 'string'
            ? parseFloat(b.g_rating)
            : b.g_rating || 0;
        return ratingB - ratingA;
      })
      .slice(0, 5); // Limit to top 5 restaurants
  }, [restaurants, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredRestaurants.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRestaurants = filteredRestaurants.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Trip management
  const handleAddToTrip = (restaurantId: string) => {
    const restaurant = restaurants.find((r) => r.id === restaurantId);

    if (restaurant) {
      addRestaurant(restaurant);
      // Navigate to plan page to show the added restaurant
      router.push('/explore/review');
    }
  };

  const handleRemoveFromTrip = (restaurantId: string) => {
    if (trip.restaurant?.restaurant.id === restaurantId) {
      removeRestaurant();
    }
  };

  useEffect(() => {
    if (!trip.vineyards.length) {
      router.push('/explore');
    }
  }, [trip.vineyards.length, router]);

  return (
    <VineyardTourLayout
      currentStep='lunch'
      title='Lunch Selection'
      subtitle='Choose a restaurant for your wine tour'
    >
      <NavigationWarning />
      {/* Filters */}
      <div className='container mx-auto px-4'>
        <RestaurantFilters onFiltersChange={handleFiltersChange} />
      </div>

      {/* Results Header */}
      <div className='container mx-auto px-4 py-6'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>
              Explore Restaurants
            </h2>
            <p className='text-gray-600 mt-1'>
              {filteredRestaurants.length} restaurant
              {filteredRestaurants.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <div className='flex items-center gap-4'>
            {/* {trip.vineyards.length > 0 && (
              <p className='text-sm text-vineyard-600'>
                {trip.vineyards.length}/3 vineyards selected
              </p>
            )} */}
            {(trip.restaurant || trip.vineyards.length > 0) && (
              <Button
                className='bg-vineyard-500 hover:bg-vineyard-600'
                onClick={() => router.push('/explore/review')}
              >
                Next: Review
                {trip.restaurant && trip.vineyards.length > 0 && ' ✓'}
                {hasUnsavedChanges && ' ⚠️'}
              </Button>
            )}
          </div>
        </div>

        {/* Restaurant Grid */}
        {paginatedRestaurants.length > 0 ? (
          <>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
              {paginatedRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onAddToTrip={handleAddToTrip}
                  onRemoveFromTrip={handleRemoveFromTrip}
                  isInTrip={trip.restaurant?.restaurant.id === restaurant.id}
                />
              ))}
            </div>

            {/* Pagination */}
            <PaginationCustom
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl='/explore/lunch'
              className='mb-8'
            />
          </>
        ) : (
          <div className='text-center py-12'>
            <div className='mx-auto mb-4 p-3 bg-gray-100 rounded-full w-fit'>
              <Utensils className='h-8 w-8 text-gray-400' />
            </div>
            {!hasAllRequiredFilters ? (
              <>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Select All Filters to Search
                </h3>
                <p className='text-gray-600 mb-4'>
                  Please select the following filters to discover restaurants:{' '}
                  {getMissingFilters.join(', ')}
                </p>
              </>
            ) : (
              <>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  No restaurants found
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
                      rating: 'all',
                      search: '',
                      distance: 'all',
                      startingPoint: 'all',
                    })
                  }
                >
                  Clear All Filters
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </VineyardTourLayout>
  );
}
