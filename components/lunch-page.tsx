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
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 12;

export default function LunchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = parseInt(searchParams.get('page') || '1');
  const { trip, addRestaurant, removeRestaurant } = useTrip();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<RestaurantFilterState>({
    area: '',
    // type: '',
    cost: '',
    rating: 'all',
    search: '',
    distance: '',
    startingPoint: 'all',
  });

  // Function to fetch restaurants from API with filters
  const fetchRestaurants = useCallback(
    async (filterParams: RestaurantFilterState) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        // Map frontend filter names to API parameter names
        if (filterParams.area && filterParams.area !== '') {
          params.set('region', filterParams.area);
        }
        // if (filterParams.type && filterParams.type !== '') {
        //   params.set('type', filterParams.type);
        // }
        if (filterParams.search && filterParams.search !== '') {
          params.set('search', filterParams.search);
        }
        if (filterParams.rating && filterParams.rating !== 'all') {
          // Convert rating filter to minRating
          switch (filterParams.rating) {
            case '4-plus':
              params.set('minRating', '4.0');
              break;
            case '4.5-plus':
              params.set('minRating', '4.5');
              break;
            case '3.5-plus':
              params.set('minRating', '3.5');
              break;
          }
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

        const response = await fetch(`/api/restaurants?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch restaurants');
        }

        const result = await response.json();
        setRestaurants(result.data || []);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initialize filters from URL on component mount
  useEffect(() => {
    const urlFilters: RestaurantFilterState = {
      area: searchParams.get('area') || '',
      // type: searchParams.get('type') || '',
      cost: searchParams.get('cost') || '',
      rating: searchParams.get('rating') || 'all',
      search: searchParams.get('search') || '',
      distance: '',
      startingPoint: 'all',
    };
    setFilters(urlFilters);

    // Only fetch if we have required filters
    if (urlFilters.area && urlFilters.cost) {
      fetchRestaurants(urlFilters);
    }
  }, [searchParams, fetchRestaurants]);

  // Handle filter changes from RestaurantFilters component
  const handleFiltersChange = useCallback(
    (newFilters: RestaurantFilterState) => {
      setFilters(newFilters);
      fetchRestaurants(newFilters);
    },
    [fetchRestaurants]
  );

  // Check if user has selected all required filters
  const hasAllRequiredFilters = useMemo(() => {
    return filters.area !== '' && filters.cost !== '';
  }, [filters]);

  // Use restaurants directly from API (already filtered on server)
  const filteredRestaurants = hasAllRequiredFilters ? restaurants : [];

  // Combine selected restaurant with search results, showing selected one first
  const combinedRestaurants = useMemo(() => {
    if (!hasAllRequiredFilters && !trip.restaurant) {
      return [];
    }

    const selectedRestaurants = trip.restaurant
      ? [
          {
            ...trip.restaurant.restaurant,
            isSelected: true,
          },
        ]
      : [];

    // Get non-selected restaurants from search results
    const nonSelectedRestaurants = filteredRestaurants
      .filter((r) => r.id !== trip.restaurant?.restaurant.id)
      .map((r) => ({ ...r, isSelected: false }));

    return [...selectedRestaurants, ...nonSelectedRestaurants];
  }, [filteredRestaurants, trip.restaurant, hasAllRequiredFilters]);

  // Pagination - apply to combined results
  const totalPages = Math.ceil(combinedRestaurants.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRestaurants = combinedRestaurants.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Trip management
  const handleAddToTrip = (restaurantId: string) => {
    const restaurant = restaurants.find((r) => r.id === restaurantId);

    if (restaurant) {
      addRestaurant(restaurant);
      // Navigate to plan page to show the added restaurant
      // router.push('/explore/trip');
    }
  };

  const handleRemoveFromTrip = (restaurantId: string) => {
    if (trip.restaurant?.restaurant.id === restaurantId) {
      removeRestaurant();
    }
  };

  console.log({ trip });

  return (
    <VineyardTourLayout
      currentStep='lunch'
      title='Lunch Selection'
      subtitle='Choose a restaurant for your wine tour'
    >
      <NavigationWarning />
      {/* Filters */}
      <div className='container mx-auto px-4 mt-6'>
        <h2 className='text-xl md:text-2xl font-bold text-gray-900 mb-4'>
          Explore
        </h2>
        <RestaurantFilters onFiltersChange={handleFiltersChange} />
      </div>

      {/* Results Header */}
      {/* {(combinedRestaurants.length > 0 || trip.restaurant) && ( */}
      <div className='container mx-auto px-4 py-4' id='restaurants'>
        <div
          className={cn(
            'mb-4 flex  items-center',
            combinedRestaurants.length > 0 || trip.restaurant
              ? 'justify-between'
              : 'justify-end'
          )}
        >
          {(combinedRestaurants.length > 0 || trip.restaurant) && (
            <div>
              <h2 className='text-2xl font-semibold md:font-bold text-gray-900'>
                Restaurants
              </h2>
            </div>
          )}
          {!trip.restaurant && (
            <Button
              className='bg-vineyard-500 hover:bg-vineyard-600'
              onClick={() => router.push('/explore/trip')}
            >
              Skip
            </Button>
          )}
        </div>

        {/* Restaurant Grid */}
        {loading ? (
          <div className='text-center py-12'>
            <p className='text-gray-600'>Loading restaurants...</p>
          </div>
        ) : paginatedRestaurants.length > 0 ? (
          <>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
              {paginatedRestaurants.map((restaurant) => {
                const isSelected = restaurant.isSelected;
                return (
                  <div key={restaurant.id} className='relative'>
                    {isSelected && (
                      <div className='absolute -top-2 -left-2 z-10'>
                        <div className='bg-vineyard-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm'>
                          Selected
                        </div>
                      </div>
                    )}
                    <RestaurantCard
                      restaurant={restaurant}
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
              baseUrl='/explore/lunch'
              className='mb-8'
            />
          </>
        ) : (
          <div className='text-center py-12'>
            {!hasAllRequiredFilters && !trip.restaurant ? (
              <></>
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
                  onClick={() => {
                    const clearedFilters = {
                      area: '',
                      // type: '',
                      cost: '',
                      rating: 'all',
                      search: '',
                      distance: '',
                      startingPoint: 'all',
                    };
                    setFilters(clearedFilters);
                    setRestaurants([]);
                  }}
                >
                  Clear All Filters
                </Button>
              </>
            )}
          </div>
        )}
      </div>
      {/* )} */}

      {trip.restaurant && (
        <div className='container mx-auto px-4 flex justify-end mt-4'>
          <Button
            className='bg-vineyard-500 hover:bg-vineyard-600'
            onClick={() => router.push('/explore/trip')}
          >
            Next: Trip
          </Button>
        </div>
      )}
    </VineyardTourLayout>
  );
}
