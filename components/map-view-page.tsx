'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserButton } from '@clerk/nextjs';
import {
  ArrowLeft,
  Grape,
  UtensilsCrossed,
  Navigation,
  Clock,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Vineyard, Restaurant } from '@/lib/types';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function MapViewPage() {
  // const { state } = useItinerary();
  const state = null as any;
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAOLGODffNh8gFlL_BclN9EhTaol6vb18o&callback=initMap`;
      script.async = true;
      script.defer = true;

      // Set up callback
      window.initMap = initializeMap;

      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current || state.items.length === 0) return;

      // Calculate center point from all locations
      const locations = state.items.map((item) => item.data.coordinates);
      const center = {
        lat:
          locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length,
        lng:
          locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length,
      };

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: 13,
        center,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          // Hide unnecessary POI labels for cleaner look
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
          // Enhance roads visibility
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#ffffff' }],
          },
          {
            featureType: 'road',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }],
          },
          // Enhance landscape
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
          // Administrative boundaries
          {
            featureType: 'administrative',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#c7c7c7' }],
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

      // Add markers for each location
      const markers: any[] = [];
      const infoWindows: any[] = [];

      state.items.forEach((item, index) => {
        const data = item.data as Vineyard | Restaurant;
        const isVineyard = item.type === 'vineyard';

        const marker = new window.google.maps.Marker({
          position: data.coordinates,
          map: mapInstance,
          title: data.name,
          icon: {
            url: isVineyard
              ? 'data:image/svg+xml;base64,' +
                btoa(`
                 <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                   <circle cx="20" cy="20" r="18" fill="#7c3aed" stroke="#ffffff" stroke-width="3"/>
                   <path d="M20 8c-3.5 0-6.5 2.5-6.5 6 0 4.5 6.5 12 6.5 12s6.5-7.5 6.5-12c0-3.5-3-6-6.5-6zm0 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="white"/>
                 </svg>
               `)
              : 'data:image/svg+xml;base64,' +
                btoa(`
                 <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                   <circle cx="20" cy="20" r="18" fill="#ea580c" stroke="#ffffff" stroke-width="3"/>
                   <path d="M12 14h16v2H12zm0 4h16v2H12zm0 4h16v2H12zm4-10h8v2h-8z" fill="white"/>
                 </svg>
               `),
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 20),
          },
          label: {
            text: (index + 1).toString(),
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px',
          },
          zIndex: 1000 + index,
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; color: #1f2937;">${data.name}</h3>
              <div style="display: flex; align-items: center; margin-bottom: 4px; color: #6b7280;">
                <span style="margin-right: 4px;">⭐</span>
                <span>${
                  data.rating
                } (${data.reviewCount.toLocaleString()} reviews)</span>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 8px; color: #6b7280;">
                <span style="margin-right: 4px;">📍</span>
                <span>${data.location}</span>
              </div>
              <div style="display: flex; align-items: center; color: #7c3aed;">
                <span style="margin-right: 4px;">🕐</span>
                <span>${item.time}${
            item.duration ? ` | ${item.duration}` : ''
          }</span>
              </div>
            </div>
          `,
        });

        marker.addListener('click', () => {
          // Close all other info windows
          infoWindows.forEach((iw) => iw.close());
          infoWindow.open(mapInstance, marker);
        });

        markers.push(marker);
        infoWindows.push(infoWindow);
      });

      // Create route between locations if there are multiple
      if (state.items.length > 1) {
        const directionsService = new window.google.maps.DirectionsService();
        const directionsRenderer = new window.google.maps.DirectionsRenderer({
          suppressMarkers: true, // We have our own custom markers
          polylineOptions: {
            strokeColor: '#7c3aed',
            strokeWeight: 5,
            strokeOpacity: 0.8,
          },
          panel: null,
        });

        directionsRenderer.setMap(mapInstance);

        // Sort items by time for proper routing
        const sortedItems = [...state.items].sort((a, b) => {
          const timeA = a.time.replace(':', '');
          const timeB = b.time.replace(':', '');
          return timeA.localeCompare(timeB);
        });

        if (sortedItems.length === 2) {
          // Direct route for 2 locations
          const request = {
            origin: sortedItems[0].data.coordinates,
            destination: sortedItems[1].data.coordinates,
            travelMode: window.google.maps.TravelMode.DRIVING,
            unitSystem: window.google.maps.UnitSystem.METRIC,
          };

          directionsService.route(request, (result: any, status: any) => {
            if (status === 'OK') {
              directionsRenderer.setDirections(result);

              // Update travel time in sidebar
              const route = result.routes[0];
              const duration = route.legs.reduce(
                (total: number, leg: any) => total + leg.duration.value,
                0
              );
              const minutes = Math.round(duration / 60);

              // Update the travel time display
              const timeElement = document.querySelector('[data-travel-time]');
              if (timeElement) {
                timeElement.textContent = `${minutes} min`;
              }
            }
          });
        } else if (sortedItems.length > 2) {
          // Multi-stop route with waypoints
          const waypoints = sortedItems.slice(1, -1).map((item) => ({
            location: item.data.coordinates,
            stopover: true,
          }));

          const request = {
            origin: sortedItems[0].data.coordinates,
            destination: sortedItems[sortedItems.length - 1].data.coordinates,
            waypoints: waypoints,
            travelMode: window.google.maps.TravelMode.DRIVING,
            optimizeWaypoints: false,
            unitSystem: window.google.maps.UnitSystem.METRIC,
          };

          directionsService.route(request, (result: any, status: any) => {
            if (status === 'OK') {
              directionsRenderer.setDirections(result);

              // Calculate total travel time
              const route = result.routes[0];
              const duration = route.legs.reduce(
                (total: number, leg: any) => total + leg.duration.value,
                0
              );
              const minutes = Math.round(duration / 60);

              // Update the travel time display
              const timeElement = document.querySelector('[data-travel-time]');
              if (timeElement) {
                timeElement.textContent = `${minutes} min`;
              }
            } else {
              console.error('Directions request failed due to ' + status);
            }
          });
        }
      }

      setMapLoaded(true);
    };

    loadGoogleMaps();

    return () => {
      // Cleanup
      if (window.initMap) {
        delete window.initMap;
      }
    };
  }, [state.items]);

  if (state.items.length === 0) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50'>
        <header className='border-b border-gray-200 bg-white/80 backdrop-blur-sm'>
          <div className='container mx-auto px-4 py-4'>
            <div className='flex justify-between items-center'>
              <div className='flex items-center space-x-3'>
                <Link href='/itinerary'>
                  <Button variant='ghost' size='icon'>
                    <ArrowLeft className='h-5 w-5' />
                  </Button>
                </Link>
                <Navigation className='h-8 w-8 text-purple-600' />
                <div>
                  <h1 className='text-2xl font-bold text-gray-900'>Map View</h1>
                  <p className='text-sm text-gray-600'>Your tour route</p>
                </div>
              </div>
              <UserButton />
            </div>
          </div>
        </header>

        <div className='container mx-auto px-4 py-16 text-center'>
          <Navigation className='h-16 w-16 text-gray-300 mx-auto mb-4' />
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>
            No locations to show
          </h2>
          <p className='text-gray-600 mb-6'>
            Add some vineyard visits to see your route on the map
          </p>
          <Link href='/vineyard-search'>
            <Button className='bg-purple-600 hover:bg-purple-700 text-white'>
              Add Vineyard Visit
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50'>
      {/* Header */}
      <header className='border-b border-gray-200 bg-white/80 backdrop-blur-sm'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center space-x-3'>
              <Link href='/itinerary'>
                <Button variant='ghost' size='icon'>
                  <ArrowLeft className='h-5 w-5' />
                </Button>
              </Link>
              <Navigation className='h-8 w-8 text-purple-600' />
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>
                  Your Champagne Day
                </h1>
                <p className='text-sm text-gray-600'>Interactive route map</p>
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

      <div className='flex flex-col lg:flex-row h-[calc(100vh-80px)]'>
        {/* Map Container */}
        <div className='flex-1 relative'>
          <div ref={mapRef} className='w-full h-full min-h-[400px]' />
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
        <div className='lg:w-80 bg-white border-l border-gray-200 overflow-y-auto'>
          <div className='p-6'>
            <h2 className='text-lg font-bold text-gray-900 mb-4'>
              Your Itinerary
            </h2>
            <div className='space-y-3'>
              {state.items
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((item, index) => {
                  const data = item.data as Vineyard | Restaurant;
                  const isVineyard = item.type === 'vineyard';

                  return (
                    <Card
                      key={item.id}
                      className='border-l-4 border-l-purple-500'
                    >
                      <CardContent className='p-4'>
                        <div className='flex items-start space-x-3'>
                          <div
                            className={`p-2 rounded-full ${
                              isVineyard
                                ? 'bg-purple-100 text-purple-600'
                                : 'bg-orange-100 text-orange-600'
                            }`}
                          >
                            {isVineyard ? (
                              <Grape className='h-4 w-4' />
                            ) : (
                              <UtensilsCrossed className='h-4 w-4' />
                            )}
                          </div>
                          <div className='flex-1 min-w-0'>
                            <h3 className='font-semibold text-gray-900 truncate'>
                              {data.name}
                            </h3>
                            <div className='flex items-center text-sm text-gray-600 mt-1'>
                              <Clock className='h-3 w-3 mr-1' />
                              <span>{item.time}</span>
                              {item.duration && (
                                <span className='ml-1'>| {item.duration}</span>
                              )}
                            </div>
                            <p className='text-xs text-gray-500 mt-1'>
                              {data.location}
                            </p>
                          </div>
                          <div className='flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold'>
                            {index + 1}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>

            <div className='mt-6 pt-6 border-t border-gray-200'>
              <div className='bg-purple-50 rounded-lg p-4 mb-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-purple-900'>
                      Total Travel Time
                    </p>
                    <p className='text-xs text-purple-600'>
                      Estimated driving time between locations
                    </p>
                  </div>
                  <span
                    className='text-lg font-bold text-purple-600'
                    data-travel-time
                  >
                    Calculating...
                  </span>
                </div>
              </div>

              <div className='space-y-2 mb-4'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-600'>Total Stops:</span>
                  <span className='font-medium'>{state.items.length}</span>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-600'>Vineyards:</span>
                  <span className='font-medium'>
                    {
                      state.items.filter((item) => item.type === 'vineyard')
                        .length
                    }
                  </span>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-600'>Restaurants:</span>
                  <span className='font-medium'>
                    {
                      state.items.filter((item) => item.type === 'restaurant')
                        .length
                    }
                  </span>
                </div>
              </div>

              <Link href='/itinerary'>
                <Button className='w-full bg-purple-600 hover:bg-purple-700 text-white'>
                  Back to Itinerary
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
