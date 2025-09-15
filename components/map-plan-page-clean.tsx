'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserMenu } from '@/components/ui/user-menu';
import { Input } from '@/components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ArrowLeft,
  Grape,
  Utensils,
  Navigation,
  Clock,
  Loader2,
  AlertCircle,
  MapPin,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Star,
  MapIcon,
  ArrowLeftRight,
  Circle,
  Pencil,
  Check,
  X,
  PencilLine,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import VineyardTourLayout from '@/components/layouts/vineyard-tour-layout';
import { SimpleAccessGuard } from '@/components/simple-access-guard';
import { useSimpleSubscription } from '@/lib/context/simple-subscription-context';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface ConfirmedPlan {
  id: string;
  title: string;
  vineyards: any[];
  restaurant?: any;
  status: string;
  confirmedAt: string;
  expiresAt: string;
  customOrder?: Array<{ id: string; order: number; type: string }>;
}

interface LocationItem {
  id: string;
  type: 'vineyard' | 'restaurant';
  name: string;
  time: string;
  lat: number;
  lng: number;
  offer?: any;
  data: any;
}

const formatTime12h = (time: string) => {
  if (!time || !time.includes(':')) return time;
  const [hours, minutes] = time.split(':');
  let h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // the hour '0' should be '12'
  return `${h}:${minutes} ${ampm}`;
};

// Sortable Item Component
function SortableLocationItem({
  location,
  index,
  isCollapsed,
  onToggleCollapse,
  onReplaceLunch,
  onUpdateTime,
  onHighlightMarker,
  onShowInfoWindow,
}: {
  location: LocationItem;
  index: number;
  isCollapsed: boolean;
  onToggleCollapse: (id: string) => void;
  onReplaceLunch?: () => void;
  onUpdateTime?: (locationId: string, time: string) => void;
  onHighlightMarker?: (locationId: string) => void;
  onShowInfoWindow?: (locationId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: location.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isVineyard = location.type === 'vineyard';
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [tempTime, setTempTime] = useState(location.time || '');

  const handleTimeSubmit = () => {
    if (onUpdateTime) {
      onUpdateTime(location.id, tempTime);
    }
    setIsEditingTime(false);
  };

  const handleTimeCancel = () => {
    setTempTime(location.time || '');
    setIsEditingTime(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
        isDragging ? 'shadow-lg border-gray-300' : ''
      }`}
      onMouseEnter={() => onHighlightMarker?.(location.id)}
      onClick={() => onShowInfoWindow?.(location.id)}
    >
      <div className='px-2 py-3'>
        <div className='flex items-start space-x-2'>
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className='cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded'
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className='h-4 w-4 text-gray-400' />
          </div>

          {/* Simple black rounded icon */}
          <div className='rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
            <Circle
              className={cn(
                'h-4 w-4',
                location.type === 'vineyard'
                  ? 'text-black fill-black'
                  : 'text-orange-500 fill-orange-500'
              )}
            />
          </div>

          <div className='flex-1 min-w-0'>
            <div className='flex items-center justify-between'>
              <div className='flex-1 min-w-0'>
                <h3 className='font-medium text-gray-900 truncate text-sm'>
                  {location.name}
                </h3>
              </div>

              <div className='flex items-center gap-1 ml-2'>
                {location.time && !isEditingTime && (
                  <div className='flex items-center text-xs text-gray-500 mt-1'>
                    <Clock className='h-3 w-3 mr-1' />
                    <span>{formatTime12h(location.time)}</span>
                  </div>
                )}
                {isEditingTime ? (
                  <>
                    <Input
                      type='time'
                      value={tempTime}
                      onChange={(e) => setTempTime(e.target.value)}
                      className='h-7 text-xs w-28'
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTimeSubmit();
                      }}
                      className='h-7 w-7 text-green-600 hover:bg-green-50 hover:text-green-700'
                    >
                      <Check className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTimeCancel();
                      }}
                      className='h-7 w-7 text-red-600 hover:bg-red-50 hover:text-red-700'
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </>
                ) : (
                  <>
                    {location.time ? (
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditingTime(true);
                        }}
                        className='h-7 w-7 text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                      >
                        <PencilLine className='h-4 w-4' />
                      </Button>
                    ) : (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditingTime(true);
                        }}
                        className='h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                      >
                        {location.time ? 'Edit Time' : 'Add Time'}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            {isVineyard && location.offer && (
              <div className='mt-2 text-xs text-blue-600 bg-blue-50 rounded px-2 py-1 inline-block'>
                {location.offer.title} • €{location.offer.cost_per_adult}/person
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Toggle */}
        <div className='mt-3 pt-3 border-t border-gray-100'>
          <div className='flex items-center gap-2 justify-between'>
            <Button
              variant='ghost'
              size='sm'
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse(location.id);
              }}
              className='h-6 p-0 text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1'
            >
              {isCollapsed ? (
                <>
                  <span>Show details</span>
                  <ChevronDown className='h-3 w-3' />
                </>
              ) : (
                <>
                  <span>Hide details</span>
                  <ChevronUp className='h-3 w-3' />
                </>
              )}
            </Button>
            {!isVineyard && onReplaceLunch && (
              <Button
                variant='ghost'
                size='icon'
                onClick={(e) => {
                  e.stopPropagation();
                  onReplaceLunch();
                }}
                className='h-6 px-2 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50'
              >
                <ArrowLeftRight className='h-4 w-4' />
              </Button>
            )}
          </div>
          {/* Collapsible Details */}
          <Collapsible open={!isCollapsed}>
            <CollapsibleContent className='mt-3'>
              <div className='space-y-3 text-xs bg-gray-50 rounded-lg p-3'>
                {/* Location & Rating */}
                <div className='grid grid-cols-1 gap-2'>
                  {location.data.sub_region && (
                    <div className='flex items-start gap-2'>
                      <MapIcon className='h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0' />
                      <span className='text-gray-600'>
                        {location.data.sub_region}
                      </span>
                    </div>
                  )}

                  {location.data.g_rating && (
                    <div className='flex items-center gap-2'>
                      <Star className='h-3 w-3 text-yellow-500 flex-shrink-0' />
                      <span className='text-gray-700 font-medium'>
                        {location.data.g_rating}
                      </span>
                      {location.data.g_ratig_user && (
                        <span className='text-gray-500'>
                          (
                          {location.data.g_ratig_user.split(' / ')[1] ||
                            location.data.g_ratig_user}{' '}
                          reviews)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Vineyard-specific details */}
                {isVineyard && (
                  <>
                    {/* Experience Types */}
                    <div className='border-t border-gray-200 pt-2'>
                      <div className='text-gray-500 font-medium mb-1'>
                        Available Experiences:
                      </div>
                      <div className='flex flex-wrap gap-1'>
                        {location.data.tasting_only && (
                          <span className='bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs'>
                            Tasting
                          </span>
                        )}
                        {location.data.tour_and_tasting && (
                          <span className='bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs'>
                            Tour & Tasting
                          </span>
                        )}
                        {location.data.pairing_and_lunch && (
                          <span className='bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs'>
                            Pairing & Lunch
                          </span>
                        )}
                        {location.data.vine_experience && (
                          <span className='bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs'>
                            Vine Experience
                          </span>
                        )}
                        {location.data.masterclass_workshop && (
                          <span className='bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs'>
                            Masterclass
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Cost Range */}
                    {(location.data.lowest_cost_per_adult ||
                      location.data.highest_cost_per_adult) && (
                      <div className='flex items-center gap-2'>
                        <span className='text-gray-600'>
                          €{location.data.lowest_cost_per_adult}
                          {location.data.lowest_cost_per_adult !==
                            location.data.highest_cost_per_adult &&
                            ` - €${location.data.highest_cost_per_adult}`}{' '}
                          per person
                        </span>
                      </div>
                    )}

                    {/* Prestige & Type */}
                    <div className='flex items-center justify-between'>
                      {location.data.type && (
                        <div className='flex items-center gap-2'>
                          <div className='w-3 h-3 bg-purple-500 rounded-full flex-shrink-0'></div>
                          <span className='text-gray-600'>
                            {location.data.type}
                          </span>
                        </div>
                      )}
                      {location.data.prestige === 1 && (
                        <span className='bg-gold-100 text-gold-700 px-2 py-0.5 rounded text-xs font-medium'>
                          ⭐ Prestige
                        </span>
                      )}
                    </div>

                    {/* Key Reasons (Top 3) */}
                    {(location.data.reason_1 ||
                      location.data.reason_2 ||
                      location.data.reason_3) && (
                      <div className='border-t border-gray-200 pt-2'>
                        <div className='text-gray-500 font-medium mb-1'>
                          Why Visit:
                        </div>
                        <div className='space-y-1'>
                          {location.data.reason_1 && (
                            <div className='flex items-start gap-2'>
                              <span className='text-green-500 text-xs'>•</span>
                              <span className='text-gray-600 text-xs leading-tight'>
                                {location.data.reason_1}
                              </span>
                            </div>
                          )}
                          {location.data.reason_2 && (
                            <div className='flex items-start gap-2'>
                              <span className='text-green-500 text-xs'>•</span>
                              <span className='text-gray-600 text-xs leading-tight'>
                                {location.data.reason_2}
                              </span>
                            </div>
                          )}
                          {location.data.reason_3 && (
                            <div className='flex items-start gap-2'>
                              <span className='text-green-500 text-xs'>•</span>
                              <span className='text-gray-600 text-xs leading-tight'>
                                {location.data.reason_3}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Wine Quality Ratings */}
                    {(location.data.qr || location.data.top) && (
                      <div className='border-t border-gray-200 pt-2'>
                        <div className='text-gray-500 font-medium mb-1'>
                          Wine Ratings:
                        </div>
                        <div className='flex gap-4'>
                          {location.data.qr && (
                            <div className='flex items-center gap-1'>
                              <span className='text-purple-500'>🍷</span>
                              <span className='text-gray-600'>
                                Quality: {location.data.qr}
                              </span>
                            </div>
                          )}
                          {location.data.top && (
                            <div className='flex items-center gap-1'>
                              <span className='text-gold-500'>👑</span>
                              <span className='text-gray-600'>
                                Top: {location.data.top}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Availability */}
                    {(location.data.saturday_high ||
                      location.data.sunday_high ||
                      location.data.saturday_low ||
                      location.data.sunday_low) && (
                      <div className='flex items-center gap-2'>
                        <Clock className='h-3 w-3 text-gray-500 flex-shrink-0' />
                        <span className='text-gray-600'>
                          Weekend availability:
                          {(location.data.saturday_high ||
                            location.data.saturday_low) &&
                            ' Sat'}
                          {(location.data.sunday_high ||
                            location.data.sunday_low) &&
                            ' Sun'}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {/* Restaurant-specific details */}
                {!isVineyard && (
                  <>
                    {/* Cuisine & Cost */}
                    <div className='flex items-center justify-between'>
                      {location.data.actual_type && (
                        <div className='flex items-center gap-2'>
                          <div className='w-3 h-3 bg-orange-500 rounded-full flex-shrink-0'></div>
                          <span className='text-gray-600'>
                            {location.data.actual_type}
                          </span>
                        </div>
                      )}
                      {location.data.bracket && (
                        <span className='bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-medium'>
                          {location.data.bracket} Bracket
                        </span>
                      )}
                    </div>

                    {location.data.avg_est_lunch_cost && (
                      <div className='flex items-center gap-2'>
                        <span className='text-gray-500'>💰</span>
                        <span className='text-gray-600'>
                          Avg. Lunch Cost: €{location.data.avg_est_lunch_cost}
                        </span>
                      </div>
                    )}

                    {/* Opening Days */}
                    {location.data.open_days && (
                      <div className='flex items-center gap-2'>
                        <Clock className='h-3 w-3 text-gray-500 flex-shrink-0' />
                        <span className='text-gray-600'>
                          Open: {location.data.open_days}
                        </span>
                      </div>
                    )}

                    {/* TripAdvisor Rating */}
                    {location.data.ta_rating && (
                      <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 bg-green-500 rounded-full flex-shrink-0'></div>
                        <span className='text-gray-600'>
                          TripAdvisor: {location.data.ta_rating}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {/* External Links */}
                <div className='border-t border-gray-200 pt-2 flex gap-2'>
                  {(location.data.maplink || location.data.gkp_link) && (
                    <a
                      href={location.data.maplink || location.data.gkp_link}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-600 hover:text-blue-800 text-xs underline'
                    >
                      See more
                    </a>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}

export default function MapViewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('planId');
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [plan, setPlan] = useState<ConfirmedPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [routeInfo, setRouteInfo] = useState<{
    totalDistance: string;
    totalDuration: string;
    legs: Array<{ distance: string; duration: string }>;
  } | null>(null);
  const { subscription } = useSimpleSubscription();
  console.log('🚀 ~ MapViewPage ~ subscription:', subscription);
  const [sortedLocations, setSortedLocations] = useState<LocationItem[]>([]);
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);
  const [routeOverlays, setRouteOverlays] = useState<any[]>([]);
  const [markers, setMarkers] = useState<any[]>([]);
  const [infoWindows, setInfoWindows] = useState<any[]>([]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setSortedLocations((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update map with new order
        updateMapWithNewOrder(newItems);

        // Save order to database
        saveDragOrder(newItems);

        return newItems;
      });
    }
  };

  // Handle collapsible toggle
  const handleToggleCollapse = (id: string) => {
    setCollapsedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Handle adding vineyard
  const handleAddVineyard = () => {
    router.push('/explore');
  };

  // Handle replacing lunch
  const handleReplaceLunch = () => {
    router.push('/explore/lunch');
  };

  // Handle time updates
  const handleUpdateTime = async (locationId: string, time: string) => {
    try {
      // Update local state first
      setSortedLocations((prev) =>
        prev.map((loc) => (loc.id === locationId ? { ...loc, time } : loc))
      );

      // Save to database
      const response = await fetch('/api/plans/update-time', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan?.id,
          locationId,
          time,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update time');
      }
    } catch (error) {
      console.error('Error updating time:', error);
      // Revert local state on error
      if (plan) {
        const originalLocation = [...plan.vineyards, plan.restaurant].find(
          (item) =>
            (item.vineyard &&
              `vineyard-${plan.vineyards.indexOf(item)}` === locationId) ||
            (item.restaurant && `restaurant-0` === locationId)
        );
        if (originalLocation) {
          setSortedLocations((prev) =>
            prev.map((loc) =>
              loc.id === locationId
                ? { ...loc, time: originalLocation.time || '' }
                : loc
            )
          );
        }
      }
    }
  };

  // Save drag order to database
  const saveDragOrder = async (newLocations: LocationItem[]) => {
    try {
      const orderData = newLocations.map((loc, index) => ({
        id: loc.id,
        order: index,
        type: loc.type,
      }));

      const response = await fetch('/api/plans/update-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan?.id,
          order: orderData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save order');
      }
    } catch (error) {
      console.error('Error saving drag order:', error);
    }
  };

  // Calculate subscription time remaining
  const getSubscriptionTimeRemaining = () => {
    if (!subscription.expiresAt) return null;

    const now = new Date();
    const expiryDate = new Date(subscription.expiresAt);
    const diffTime = expiryDate.getTime() - now.getTime();

    if (diffTime <= 0) return 'Expired';

    const minutes = Math.floor(diffTime / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h left`;
    if (hours > 0) return `${hours}h ${minutes % 60}m left`;
    return `${minutes}m left`;
  };

  // Calculate plan expiry time remaining
  const getPlanTimeRemaining = () => {
    if (!plan?.expiresAt) return null;

    const now = new Date();
    const expiryDate = new Date(plan.expiresAt);
    const diffTime = expiryDate.getTime() - now.getTime();

    if (diffTime <= 0) return 'Expired';

    const minutes = Math.floor(diffTime / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h left`;
    if (hours > 0) return `${hours}h ${minutes % 60}m left`;
    return `${minutes}m left`;
  };

  // Clear all map overlays and markers
  const clearMapOverlays = () => {
    // Clear directions renderer
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
    }

    // Clear route overlays
    routeOverlays.forEach((overlay) => {
      if (overlay && overlay.setMap) {
        overlay.setMap(null);
      }
    });
    setRouteOverlays([]);

    // Clear markers
    markers.forEach((marker) => {
      if (marker && marker.setMap) {
        marker.setMap(null);
      }
    });
    setMarkers([]);

    // Clear info windows
    infoWindows.forEach((infoWindow) => {
      if (infoWindow && infoWindow.close) {
        infoWindow.close();
      }
    });
    setInfoWindows([]);
  };

  // Create markers for locations
  const createMarkers = (locations: LocationItem[]) => {
    if (!map || !window.google) return;

    const newMarkers: any[] = [];
    const newInfoWindows: any[] = [];

    locations.forEach((location, index) => {
      const isVineyard = location.type === 'vineyard';

      // Use standard Google Maps markers
      const marker = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        title: location.name,
        icon: {
          url: isVineyard
            ? 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png'
            : 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png',
          scaledSize: new window.google.maps.Size(32, 32),
        },
        label: {
          text: (index + 1).toString(),
          color: 'white',
          fontWeight: 'bold',
          fontSize: '12px',
        },
        zIndex: 1000 + index,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; min-width: 250px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${
              location.name
            }</h3>
            ${
              location.data.g_rating
                ? `
              <div style="display: flex; align-items: center; margin-bottom: 6px; color: #6b7280; font-size: 14px;">
                <span style="margin-right: 6px;">⭐</span>
                <span>${location.data.g_rating} ${
                    location.data.g_ratig_user
                      ? `(${location.data.g_ratig_user})`
                      : ''
                  }</span>
              </div>
            `
                : ''
            }
            ${
              location.data.sub_region
                ? `
              <div style="display: flex; align-items: center; margin-bottom: 8px; color: #6b7280; font-size: 14px;">
                <span style="margin-right: 6px;">📍</span>
                <span>${location.data.sub_region}</span>
              </div>
            `
                : ''
            }
            ${
              location.time
                ? `
              <div style="display: flex; align-items: center; color: #7c3aed; font-size: 14px; font-weight: 500;">
                <span style="margin-right: 6px;">🕐</span>
                <span>Scheduled for ${formatTime12h(location.time)}</span>
              </div>
            `
                : ''
            }
            ${
              isVineyard && location.offer
                ? `
              <div style="margin-top: 8px; padding: 8px; background: #f3f4f6; border-radius: 6px;">
                <div style="font-size: 14px; font-weight: 500; color: #374151;">${location.offer.title}</div>
                <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">${location.offer.duration} • €${location.offer.cost_per_adult}/person</div>
              </div>
            `
                : ''
            }
          </div>
        `,
      });

      marker.addListener('click', () => {
        // Close all other info windows
        newInfoWindows.forEach((iw) => iw.close());
        infoWindow.open(map, marker);
      });

      // Store reference to location ID for hover effects
      marker.locationId = location.id;

      newMarkers.push(marker);
      newInfoWindows.push(infoWindow);
    });

    setMarkers(newMarkers);
    setInfoWindows(newInfoWindows);
  };

  // Create route between locations
  const createRoute = (locations: LocationItem[]) => {
    if (!map || !window.google || locations.length < 2) return;

    const directionsService = new window.google.maps.DirectionsService();
    const newDirectionsRenderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true, // We use our own markers
      polylineOptions: {
        strokeColor: '#10b981',
        strokeWeight: 4,
        strokeOpacity: 0.8,
      },
    });

    newDirectionsRenderer.setMap(map);
    setDirectionsRenderer(newDirectionsRenderer);

    if (locations.length === 2) {
      // Direct route for 2 locations
      const request = {
        origin: { lat: locations[0].lat, lng: locations[0].lng },
        destination: { lat: locations[1].lat, lng: locations[1].lng },
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
      };

      directionsService.route(request, (result: any, status: any) => {
        if (status === 'OK') {
          newDirectionsRenderer.setDirections(result);

          const leg = result.routes[0].legs[0];
          setRouteInfo({
            totalDistance: leg.distance.text,
            totalDuration: leg.duration.text,
            legs: [
              { distance: leg.distance.text, duration: leg.duration.text },
            ],
          });
        } else {
          console.error('Directions request failed:', status);
        }
      });
    } else {
      // Multi-stop route with waypoints
      const waypoints = locations.slice(1, -1).map((location) => ({
        location: { lat: location.lat, lng: location.lng },
        stopover: true,
      }));

      const request = {
        origin: { lat: locations[0].lat, lng: locations[0].lng },
        destination: {
          lat: locations[locations.length - 1].lat,
          lng: locations[locations.length - 1].lng,
        },
        waypoints: waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false, // Keep user's order
        unitSystem: window.google.maps.UnitSystem.METRIC,
      };

      directionsService.route(request, (result: any, status: any) => {
        if (status === 'OK') {
          newDirectionsRenderer.setDirections(result);

          const route = result.routes[0];
          const totalDistance = route.legs.reduce(
            (total: number, leg: any) => total + leg.distance.value,
            0
          );
          const totalDuration = route.legs.reduce(
            (total: number, leg: any) => total + leg.duration.value,
            0
          );

          const legs = route.legs.map((leg: any) => ({
            distance: leg.distance.text,
            duration: leg.duration.text,
          }));

          setRouteInfo({
            totalDistance: `${(totalDistance / 1000).toFixed(1)} km`,
            totalDuration: `${Math.round(totalDuration / 60)} min`,
            legs: legs,
          });
        } else {
          console.error('Directions request failed:', status);
        }
      });
    }
  };

  // Handle marker interactions
  const highlightMarker = (locationId: string) => {
    const marker = markers.find((m) => m.locationId === locationId);
    if (marker) {
      marker.setAnimation(window.google.maps.Animation.BOUNCE);
      setTimeout(() => {
        marker.setAnimation(null);
      }, 1000);
    }
  };

  const showInfoWindow = (locationId: string) => {
    const markerIndex = markers.findIndex((m) => m.locationId === locationId);
    if (markerIndex >= 0) {
      const marker = markers[markerIndex];
      const infoWindow = infoWindows[markerIndex];

      // Close all other info windows
      infoWindows.forEach((iw) => iw.close());

      // Open the specific info window
      infoWindow.open(map, marker);

      // Center map on marker
      map.panTo(marker.getPosition());
    }
  };

  // Update map with new order
  const updateMapWithNewOrder = (newLocations: LocationItem[]) => {
    if (!map || !window.google) return;

    // Clear all existing overlays
    clearMapOverlays();

    // Create new markers
    createMarkers(newLocations);

    // Create new route
    createRoute(newLocations);
  };

  // Check subscription expiry
  useEffect(() => {
    if (!subscription.loading && subscription.expiresAt) {
      const now = new Date();
      const expiryDate = new Date(subscription.expiresAt);

      if (expiryDate <= now && !subscription.isAdmin) {
        setError(
          'Your subscription has expired. Please upgrade to continue using this feature.'
        );
        return;
      }
    }
  }, [subscription]);

  // Load plan data
  useEffect(() => {
    const loadPlan = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch('/api/plans');
        const data = await response.json();
        console.log('🚀 ~ loadPlan ~ data:', data);

        if (data.success && data.data.plans && data.data.plans.length > 0) {
          const confirmedPlan = data.data.plans[0];

          // Check if plan is expired
          if (new Date(confirmedPlan.expiresAt) <= new Date()) {
            setError('Your plan has expired.');
            return;
          }

          setPlan(confirmedPlan);
        } else {
          setError('No confirmed plan found.');
        }
      } catch (err) {
        setError('Failed to load plan data.');
        console.error('Plan loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Only load plan if subscription allows access
    if (
      !subscription.loading &&
      (subscription.hasAccess || subscription.isAdmin)
    ) {
      loadPlan();
    } else if (!subscription.loading && !subscription.hasAccess) {
      setError('Access denied. Please check your subscription.');
      setLoading(false);
    }
  }, [subscription]);

  // Prepare sorted locations when plan changes
  useEffect(() => {
    if (!plan) return;

    const allLocations: LocationItem[] = [];

    // Add vineyards
    plan.vineyards.forEach((planVineyard, index) => {
      if (planVineyard.vineyard?.latitude && planVineyard.vineyard?.longitude) {
        allLocations.push({
          id: `vineyard-${index}`,
          type: 'vineyard',
          name: planVineyard.vineyard.vineyard || planVineyard.vineyard.name,
          lat: planVineyard.vineyard.latitude,
          lng: planVineyard.vineyard.longitude,
          time: planVineyard.time || '',
          offer: planVineyard.offer,
          data: planVineyard.vineyard,
        });
      }
    });

    // Add restaurant if exists
    if (
      plan.restaurant?.restaurant?.latitude &&
      plan.restaurant?.restaurant?.longitude
    ) {
      allLocations.push({
        id: 'restaurant-0',
        type: 'restaurant',
        name:
          plan.restaurant.restaurant.restaurants ||
          plan.restaurant.restaurant.name,
        lat: plan.restaurant.restaurant.latitude,
        lng: plan.restaurant.restaurant.longitude,
        time: plan.restaurant.time || '',
        data: plan.restaurant.restaurant,
      });
    }

    // Check if there's a custom order saved
    let finalLocations = allLocations;

    if (plan.customOrder && Array.isArray(plan.customOrder)) {
      // Apply custom order
      const orderedLocations: LocationItem[] = [];
      const locationMap = new Map(allLocations.map((loc) => [loc.id, loc]));

      // Add locations in custom order
      plan.customOrder.forEach((orderItem: any) => {
        const location = locationMap.get(orderItem.id);
        if (location) {
          orderedLocations.push(location);
          locationMap.delete(orderItem.id);
        }
      });

      // Add any remaining locations that weren't in custom order
      locationMap.forEach((location) => {
        orderedLocations.push(location);
      });

      finalLocations = orderedLocations;
    } else {
      // Sort locations by time for initial order
      finalLocations = allLocations.sort((a, b) => {
        if (!a.time || !b.time) return 0;
        const timeA = a.time.replace(':', '');
        const timeB = b.time.replace(':', '');
        return timeA.localeCompare(timeB);
      });
    }

    setSortedLocations(finalLocations);

    // Set all items as collapsed by default
    const allIds = new Set(finalLocations.map((location) => location.id));
    setCollapsedItems(allIds);
  }, [plan]);

  // Initialize Google Maps
  useEffect(() => {
    if (!sortedLocations.length) return;

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBDvFyac0tiDTtGENqY_cBLEjEiO_YBt2k&callback=initMap`;
      script.async = true;
      script.defer = true;

      // Set up callback
      window.initMap = initializeMap;

      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current || !sortedLocations.length) return;

      // Calculate center point from all locations
      const center = {
        lat:
          sortedLocations.reduce((sum, loc) => sum + loc.lat, 0) /
          sortedLocations.length,
        lng:
          sortedLocations.reduce((sum, loc) => sum + loc.lng, 0) /
          sortedLocations.length,
      };

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          // Hide all POI labels for cleaner look
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
          // Hide business labels
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }],
          },
          // Hide attraction labels
          {
            featureType: 'poi.attraction',
            stylers: [{ visibility: 'off' }],
          },
          // Hide government labels
          {
            featureType: 'poi.government',
            stylers: [{ visibility: 'off' }],
          },
          // Hide medical labels
          {
            featureType: 'poi.medical',
            stylers: [{ visibility: 'off' }],
          },
          // Hide park labels
          {
            featureType: 'poi.park',
            stylers: [{ visibility: 'off' }],
          },
          // Hide place of worship labels
          {
            featureType: 'poi.place_of_worship',
            stylers: [{ visibility: 'off' }],
          },
          // Hide school labels
          {
            featureType: 'poi.school',
            stylers: [{ visibility: 'off' }],
          },
          // Hide sports complex labels
          {
            featureType: 'poi.sports_complex',
            stylers: [{ visibility: 'off' }],
          },
          // Hide transit station labels except major ones
          {
            featureType: 'transit.station',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
          // Keep only major city labels, hide small localities
          {
            featureType: 'administrative.locality',
            elementType: 'labels',
            stylers: [{ visibility: 'simplified' }],
          },
          // Hide neighborhood labels
          {
            featureType: 'administrative.neighborhood',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
          // Enhance roads for better visibility
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#ffffff' }],
          },
          {
            featureType: 'road',
            elementType: 'labels',
            stylers: [{ visibility: 'simplified' }],
          },
          // Clean landscape
          {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }],
          },
          // Water styling
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#c9d4e8' }],
          },
          // Administrative boundaries - keep major ones only
          {
            featureType: 'administrative',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#c7c7c7' }],
          },
          // Hide minor administrative labels
          {
            featureType: 'administrative.land_parcel',
            stylers: [{ visibility: 'off' }],
          },
        ],
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true,
      });

      setMap(mapInstance);
      setMapLoaded(true);
    };

    loadGoogleMaps();

    return () => {
      // Cleanup
      if ('initMap' in window) {
        delete (window as any).initMap;
      }
    };
  }, [sortedLocations]);

  // Update map when sorted locations change
  useEffect(() => {
    if (map && sortedLocations.length > 0) {
      updateMapWithNewOrder(sortedLocations);
    }
  }, [map, sortedLocations]);

  if (loading) {
    return (
      <VineyardTourLayout
        currentStep='plan'
        title='Map View'
        subtitle='Interactive route map'
      >
        <div className='min-h-[calc(100vh-119px)] bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center'>
          <div className='text-center'>
            <Loader2 className='h-12 w-12 animate-spin text-green-600 mx-auto mb-4' />
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>
              Loading Map
            </h2>
            <p className='text-gray-600'>Preparing your route...</p>
          </div>
        </div>
      </VineyardTourLayout>
    );
  }

  if (error) {
    return (
      <VineyardTourLayout
        currentStep='plan'
        title='Map View'
        subtitle='Interactive route map'
      >
        <div className='min-h-[calc(100vh-119px)] bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center'>
          <div className='text-center max-w-md mx-auto px-4'>
            <AlertCircle className='h-12 w-12 text-red-500 mx-auto mb-4' />
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>
              Unable to Load Map
            </h2>
            <p className='text-gray-600 mb-6'>{error}</p>
            <div className='space-x-3'>
              <Button
                onClick={() => router.push('/explore/plan')}
                variant='outline'
              >
                Back to Plan
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className='bg-green-600 hover:bg-green-700'
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </VineyardTourLayout>
    );
  }

  if (!plan || plan.vineyards.length === 0) {
    return (
      <VineyardTourLayout
        currentStep='plan'
        title='Map View'
        subtitle='Interactive route map'
      >
        <div className='container mx-auto px-4 py-16 text-center'>
          <MapPin className='h-16 w-16 text-gray-300 mx-auto mb-4' />
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>
            No locations to show
          </h2>
          <p className='text-gray-600 mb-6'>
            Your plan doesn't have any confirmed locations to display on the map
          </p>
          <Button
            onClick={() => router.push('/explore/plan')}
            className='bg-green-600 hover:bg-green-700 text-white'
          >
            Back to Plan
          </Button>
        </div>
      </VineyardTourLayout>
    );
  }

  return (
    <VineyardTourLayout
      currentStep='plan'
      title='Map View'
      subtitle='Interactive route map'
    >
      <div className='flex flex-col lg:flex-row h-[calc(100vh-119px)]'>
        {/* Map Container */}
        <div className='flex-1 relative order-1'>
          <div
            ref={mapRef}
            className='w-full h-full min-h-[300px] lg:min-h-[400px]'
          />
          {!mapLoaded && (
            <div className='absolute inset-0 bg-gray-100 flex items-center justify-center'>
              <div className='text-center'>
                <Navigation className='h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin' />
                <p className='text-gray-600'>Loading your route...</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar with itinerary details */}
        <div className='w-full lg:w-96 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 overflow-y-auto order-2 max-h-[40vh] lg:max-h-[calc(100vh-119px)]'>
          <div className='p-4 lg:p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-lg font-semibold text-gray-900'>Your Plan</h2>
            </div>

            {/* Add vineyard button */}
            {sortedLocations.filter((loc) => loc.type === 'vineyard').length <
              10 && (
              <Button
                onClick={handleAddVineyard}
                variant='outline'
                size='sm'
                className='w-full mb-4 text-sm border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400'
              >
                + Add Another Vineyard
              </Button>
            )}

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedLocations.map((loc) => loc.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className='space-y-3 mb-6'>
                  {sortedLocations.map((location, index) => {
                    const isVineyard = location.type === 'vineyard';
                    const vineyardCount = sortedLocations.filter(
                      (loc) => loc.type === 'vineyard'
                    ).length;

                    return (
                      <SortableLocationItem
                        key={location.id}
                        location={location}
                        index={index}
                        isCollapsed={collapsedItems.has(location.id)}
                        onToggleCollapse={handleToggleCollapse}
                        onReplaceLunch={
                          !isVineyard ? handleReplaceLunch : undefined
                        }
                        onUpdateTime={handleUpdateTime}
                        onHighlightMarker={highlightMarker}
                        onShowInfoWindow={showInfoWindow}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>

            <div className='mt-6 pt-6 border-t border-gray-200'>
              {routeInfo && (
                <div className='bg-green-50 rounded-lg p-4 mb-4'>
                  <div className='grid grid-cols-2 gap-4 text-center'>
                    <div>
                      <p className='text-sm font-medium text-green-900'>
                        Total Distance
                      </p>
                      <p className='text-lg font-bold text-green-600'>
                        {routeInfo.totalDistance}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm font-medium text-green-900'>
                        Drive Time
                      </p>
                      <p className='text-lg font-bold text-green-600'>
                        {routeInfo.totalDuration}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className='space-y-2 mb-4'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-600'>Total Stops:</span>
                  <span className='font-medium'>{sortedLocations.length}</span>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-600'>Vineyards:</span>
                  <span className='font-medium'>
                    {
                      sortedLocations.filter((item) => item.type === 'vineyard')
                        .length
                    }
                  </span>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-600'>Restaurants:</span>
                  <span className='font-medium'>
                    {
                      sortedLocations.filter(
                        (item) => item.type === 'restaurant'
                      ).length
                    }
                  </span>
                </div>
              </div>

              {/* Subscription Timer */}
              <div className='bg-white border border-gray-200 rounded-lg p-3 text-center'>
                <div className='text-xs text-gray-500 mb-1'>Subscription</div>
                <div className='flex items-center justify-center gap-2'>
                  <Clock className='h-4 w-4 text-gray-500' />
                  <span
                    className={`text-sm font-medium ${
                      subscription.isAdmin
                        ? 'text-blue-600'
                        : getSubscriptionTimeRemaining() === 'Expired'
                        ? 'text-red-600'
                        : getSubscriptionTimeRemaining()?.includes('d')
                        ? parseInt(
                            getSubscriptionTimeRemaining()?.split('d')[0] ||
                              '30'
                          ) <= 7
                          ? 'text-amber-600'
                          : 'text-green-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {subscription.isAdmin
                      ? 'Admin Access'
                      : getSubscriptionTimeRemaining() || 'Active'}
                  </span>
                </div>
                {!subscription.isAdmin &&
                  getSubscriptionTimeRemaining()?.includes('d') &&
                  parseInt(
                    getSubscriptionTimeRemaining()?.split('d')[0] || '30'
                  ) <= 7 && (
                    <Button
                      onClick={() => router.push('/upgrade')}
                      size='sm'
                      className='mt-2 w-full bg-red-600 hover:bg-red-700 text-white text-xs'
                    >
                      Renew Now
                    </Button>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </VineyardTourLayout>
  );
}
