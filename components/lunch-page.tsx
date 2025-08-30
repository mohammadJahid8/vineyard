'use client';

import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Stepper } from '@/components/ui/stepper';
import { RestaurantFilters } from '@/components/ui/restaurant-filters';
import { RestaurantCard } from '@/components/ui/restaurant-card';
import { PaginationCustom } from '@/components/ui/pagination-custom';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { Button } from '@/components/ui/button';
import { UserButton } from '@clerk/nextjs';
import { Grape, Utensils } from 'lucide-react';
import { Restaurant, RestaurantFilterState } from '@/lib/types-vineyard';
import { useTrip } from '@/lib/context/trip-context';
import { useRouter } from 'next/navigation';

const steps = [
  { id: 'vineyard', title: 'Vineyard', href: '/explore' },
  { id: 'lunch', title: 'Lunch', href: '/explore/lunch' },
  { id: 'daytrip', title: 'Day Trip', href: '/explore/day-trip' },
];

const ITEMS_PER_PAGE = 12;

interface LunchPageProps {
  restaurants: Restaurant[];
}

export default function LunchPage({ restaurants }: LunchPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = parseInt(searchParams.get('page') || '1');
  const { trip, addRestaurant, removeRestaurant } = useTrip();
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

  // Filter restaurants
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
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

      // Area filter
      if (
        filters.area &&
        filters.area !== 'all' &&
        (restaurant.sub_region || '') !== filters.area
      ) {
        return false;
      }

      // Type filter
      if (
        filters.type &&
        filters.type !== 'all' &&
        (restaurant.actual_type || '') !== filters.type
      ) {
        return false;
      }

      // Cost filter
      if (filters.cost && filters.cost !== 'all') {
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
    });
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
      // Navigate to day trip page to show the added restaurant
      router.push('/explore/day-trip');
    }
  };

  const handleRemoveFromTrip = (restaurantId: string) => {
    if (trip.restaurant?.restaurant.id === restaurantId) {
      removeRestaurant();
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
      <Stepper steps={steps} currentStep='lunch' />

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
          {trip.restaurant && (
            <Button
              className='bg-vineyard-500 hover:bg-vineyard-600'
              onClick={() => router.push('/explore/day-trip')}
            >
              View Trip
            </Button>
          )}
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
                  area: 'all',
                  type: 'all',
                  cost: 'all',
                  rating: 'all',
                  search: '',
                  distance: 'all',
                  startingPoint: 'all',
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
