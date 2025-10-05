'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, ExternalLink, Plus, X } from 'lucide-react';
import { Restaurant } from '@/lib/types-vineyard';
import { cn } from '@/lib/utils';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onAddToTrip: (restaurantId: string) => void;
  onRemoveFromTrip: (restaurantId: string) => void;
  isInTrip: boolean;
  className?: string;
}

export function RestaurantCard({
  restaurant,
  onAddToTrip,
  onRemoveFromTrip,
  isInTrip,
  className,
}: RestaurantCardProps) {
  const fallbackImage = '/placeholder.jpg';

  const handleTripAction = () => {
    if (isInTrip) {
      onRemoveFromTrip(restaurant.id);
    } else {
      onAddToTrip(restaurant.id);
    }
  };

  const getBracketColor = (bracket: string) => {
    switch (bracket?.toUpperCase()) {
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B':
        return 'bg-yellow-100 text-yellow-800';
      case 'C':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCost = (cost: number) => {
    return `€${cost}`;
  };

  return (
    <Card
      className={cn(
        'group hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-vineyard-300 bg-white overflow-hidden',
        className
      )}
    >
      {/* Image */}
      <div className='relative h-48 overflow-hidden'>
        <img
          src={restaurant.image_url}
          alt={restaurant.restaurants}
          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = fallbackImage;
          }}
        />
        <div className='absolute top-3 right-3'>
          <Button
            size='sm'
            variant={isInTrip ? 'destructive' : 'secondary'}
            onClick={handleTripAction}
            className={`h-8 w-8 p-0 ${
              isInTrip
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-white/90 hover:bg-white text-gray-700'
            }`}
          >
            {isInTrip ? (
              <X className='h-4 w-4 text-white' />
            ) : (
              <Plus className='h-4 w-4' />
            )}
          </Button>
        </div>
        {restaurant.g_rating && (
          <div className='absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1'>
            <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />
            <span className='text-xs font-medium'>{restaurant.g_rating}</span>
          </div>
        )}
      </div>

      <CardHeader className='pb-3'>
        <div className='flex justify-between items-start gap-2'>
          <h3 className='md:text-xl font-semibold text-gray-900 leading-tight line-clamp-2'>
            {restaurant.restaurants}
          </h3>
        </div>

        <div className='flex items-center gap-2 text-sm text-gray-600'>
          <MapPin className='h-4 w-4 text-vineyard-500' />
          <span className='line-clamp-1'>{restaurant.sub_region}</span>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        <div className='space-y-3'>
          {/* Type and Bracket */}
          <div className='flex items-center gap-2 flex-wrap'>
            <Badge variant='outline' className='text-xs'>
              {restaurant.actual_type}
            </Badge>
            <Badge className={`text-xs ${getBracketColor(restaurant.bracket)}`}>
              Bracket {restaurant.bracket}
            </Badge>
          </div>

          {/* Cost and Days */}
          <div className='flex items-center justify-between text-sm'>
            <div className='flex items-center gap-1'>
              <span className='text-gray-600'>Avg Cost:</span>
              <span className='font-semibold text-vineyard-700'>
                {formatCost(restaurant.avg_est_lunch_cost)}
              </span>
            </div>
            {restaurant.open_days && (
              <div className='flex items-center gap-1'>
                <Clock className='h-3 w-3 text-gray-400' />
                <span className='text-xs text-gray-600'>
                  {restaurant.open_days}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className='flex gap-2 pt-2'>
            <Button
              variant='outline'
              size='sm'
              className='flex-1'
              onClick={() => window.open(restaurant.gkp_link, '_blank')}
            >
              <ExternalLink className='h-3 w-3 mr-1' />
              View on Maps
            </Button>
            <Button
              size='sm'
              onClick={handleTripAction}
              className={`flex-1 ${
                isInTrip
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-vineyard-500 hover:bg-vineyard-600 text-white'
              }`}
            >
              {isInTrip ? (
                <>
                  <X className='h-3 w-3 mr-1' />
                  Remove
                </>
              ) : (
                <>
                  <Plus className='h-3 w-3 mr-1' />
                  Add to Trip
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
