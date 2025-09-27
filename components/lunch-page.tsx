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

export default function LunchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = parseInt(searchParams.get('page') || '1');
  const { trip, addRestaurant, removeRestaurant } = useTrip();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<RestaurantFilterState>({
    area: '',
    type: '',
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
        if (filterParams.type && filterParams.type !== '') {
          params.set('type', filterParams.type);
        }
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
      type: searchParams.get('type') || '',
      cost: searchParams.get('cost') || '',
      rating: searchParams.get('rating') || 'all',
      search: searchParams.get('search') || '',
      distance: '',
      startingPoint: 'all',
    };
    setFilters(urlFilters);

    // Only fetch if we have required filters
    if (urlFilters.area && urlFilters.type && urlFilters.cost) {
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
    return filters.area !== '' && filters.type !== '' && filters.cost !== '';
  }, [filters]);

  // Use restaurants directly from API (already filtered on server)
  const filteredRestaurants = hasAllRequiredFilters ? restaurants : [];

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

        {/* Selected Restaurant Display */}
        {trip.restaurant && (
          <div className='mt-10'>
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>
              Selected Restaurant
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              <RestaurantCard
                key={trip.restaurant.restaurant.id}
                restaurant={trip.restaurant.restaurant}
                onAddToTrip={handleAddToTrip}
                onRemoveFromTrip={handleRemoveFromTrip}
                isInTrip={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      {/* {filteredRestaurants.length > 0 && ( */}
      <div className='container mx-auto px-4 py-6' id='restaurants'>
        <div
          className='mb-4 flex justify-between items-center'
          id='restaurants'
        >
          {filteredRestaurants.length > 0 && (
            <div>
              <h2 className='text-2xl font-bold text-gray-900'>Restaurants</h2>
              <p className='text-gray-600 mt-1'>
                {filteredRestaurants.length} found
              </p>
            </div>
          )}
          {!trip.restaurant?.restaurant && (
            <div className='container mx-auto px-4 flex justify-end'>
              <Button
                className='bg-vineyard-500 hover:bg-vineyard-600'
                onClick={() => router.push('/explore/trip')}
              >
                Skip
              </Button>
            </div>
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
            {!hasAllRequiredFilters ? (
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
                      type: '',
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
