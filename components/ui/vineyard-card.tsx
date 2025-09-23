'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Star,
  MapPin,
  Clock,
  Euro,
  Plus,
  Minus,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Vineyard, Offer } from '@/lib/types-vineyard';
import Image from 'next/image';

interface VineyardCardProps {
  vineyard: Vineyard;
  offers: Offer[];
  onAddToTrip?: (vineyardId: string, offerId?: string) => void;
  onRemoveFromTrip?: (vineyardId: string) => void;
  isInTrip?: boolean;
  className?: string;
}

export function VineyardCard({
  vineyard,
  offers,
  onAddToTrip,
  onRemoveFromTrip,
  isInTrip = false,
  className,
}: VineyardCardProps) {
  console.log('🚀 ~ VineyardCard ~ vineyard:', vineyard);
  const [showOffers, setShowOffers] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);

  const highlights = [
    vineyard.reason_1,
    vineyard.reason_2,
    vineyard.reason_3,
    vineyard.reason_4,
    vineyard.reason_5,
  ].filter(Boolean);

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'international':
        return 'bg-blue-100 text-blue-800';
      case 'boutique':
        return 'bg-purple-100 text-purple-800';
      case 'grower':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCostRange = () => {
    if (vineyard.lowest_cost_per_adult === vineyard.highest_cost_per_adult) {
      return `€${vineyard.lowest_cost_per_adult}`;
    }
    return `€${vineyard.lowest_cost_per_adult} - €${vineyard.highest_cost_per_adult}`;
  };

  return (
    <Card
      className={cn(
        'overflow-hidden hover:shadow-lg transition-shadow',
        className
      )}
    >
      {/* Image */}
      {vineyard.image_url && (
        <div className='relative h-48 overflow-hidden'>
          <Image
            src={vineyard.image_url}
            alt={vineyard.vineyard}
            className='w-full h-full object-cover'
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
            width={100}
            height={100}
          />
          <div className='absolute top-3 right-3'>
            <Badge className={cn('text-xs', getTypeColor(vineyard.type))}>
              {vineyard.type}
            </Badge>
          </div>
        </div>
      )}

      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <h3 className='md:text-xl font-bold text-gray-900 mb-1'>
              {vineyard.vineyard}
            </h3>
            <div className='flex items-center text-sm text-gray-600 mb-2'>
              <MapPin className='h-4 w-4 mr-1' />
              {vineyard.sub_region}
            </div>
            <div className='flex items-center space-x-4 text-sm'>
              <div className='flex items-center'>
                <Star className='h-4 w-4 text-yellow-500 mr-1' />
                <span className='font-medium'>{vineyard.g}</span>
                <span className='text-gray-500 ml-1'>
                  ({vineyard.g_ratig_user.split('/')[1]?.trim()})
                </span>
              </div>
              <div className='flex flex-col text-vineyard-600 font-medium'>
                <span>{formatCostRange()} pp</span>
              </div>
            </div>
          </div>
          <div className='flex flex-col space-y-2'>
            {isInTrip ? (
              <Button
                variant='outline'
                size='sm'
                onClick={() => onRemoveFromTrip?.(vineyard.vineyard_id)}
                className='text-red-600 border-red-600 hover:bg-red-50'
              >
                <Minus className='h-4 w-4 mr-1' />
                Remove
              </Button>
            ) : (
              <Button
                size='sm'
                onClick={() => onAddToTrip?.(vineyard.vineyard_id)}
                className='bg-vineyard-500 hover:bg-vineyard-600 text-white'
              >
                <Plus className='h-4 w-4 mr-1' />
                Add to Trip
              </Button>
            )}
            {vineyard.maplink && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => window.open(vineyard.maplink, '_blank')}
              >
                <ExternalLink className='h-4 w-4 mr-1' />
                Website
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        {/* Highlights */}
        {highlights.length > 0 && (
          <div className='mb-2'>
            <div className='flex items-center justify-between'>
              <h4 className='text-sm font-semibold text-gray-900'>
                Highlights ({highlights.length})
              </h4>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setShowHighlights(!showHighlights)}
                className='text-vineyard-600 hover:text-vineyard-700'
              >
                {showHighlights ? 'Hide' : 'Show'}
              </Button>
            </div>

            {showHighlights && (
              <ul className='space-y-1'>
                {highlights.map((highlight, index) => (
                  <li
                    key={index}
                    className='text-sm text-gray-600 flex items-start'
                  >
                    <span className='mr-2'>•</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Offers */}
        {offers.length > 0 && (
          <div className='border-t pt-2'>
            <div className='flex items-center justify-between'>
              <h4 className='text-sm font-semibold text-gray-900'>
                Offers ({offers.length})
              </h4>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setShowOffers(!showOffers)}
                className='text-vineyard-600 hover:text-vineyard-700'
              >
                {showOffers ? 'Hide' : 'Show'}
              </Button>
            </div>

            {showOffers && (
              <div className='space-y-3'>
                {offers.map((offer, index) => (
                  <div key={index} className='bg-gray-50 rounded-lg p-3 border'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1 pr-3'>
                        <h5 className='font-medium text-sm text-gray-900 mb-1'>
                          {offer.title}
                        </h5>
                        <p className='text-xs text-gray-600'>
                          {offer.experience}
                        </p>
                      </div>
                      <div className='text-right flex-shrink-0'>
                        <div className='text-sm font-semibold text-vineyard-600'>
                          €{offer.cost_per_adult}
                        </div>
                        <div className='flex items-center text-xs text-gray-500'>
                          <Clock className='h-3 w-3 mr-1' />
                          {offer.duration}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
