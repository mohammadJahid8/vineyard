'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserMenu } from '@/components/ui/user-menu';
import {
  ArrowLeft,
  Grape,
  Utensils,
  Navigation,
  Clock,
  Loader2,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

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

  // Load plan data
  useEffect(() => {
    const loadPlan = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch('/api/plans?type=confirmed');
        const data = await response.json();

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

    loadPlan();
  }, [planId]);

  // Initialize Google Maps
  useEffect(() => {
    if (!plan || plan.vineyards.length === 0) return;

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
      if (!mapRef.current || !plan) return;

      // Prepare locations array
      const locations: Array<{
        type: 'vineyard' | 'restaurant';
        name: string;
        lat: number;
        lng: number;
        time: string;
        offer?: any;
        data: any;
      }> = [];

      // Add vineyards
      plan.vineyards.forEach((planVineyard) => {
        if (
          planVineyard.vineyard?.latitude &&
          planVineyard.vineyard?.longitude
        ) {
          locations.push({
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
        locations.push({
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

      if (locations.length === 0) return;

      // Sort locations by time for proper routing
      const sortedLocations = locations.sort((a, b) => {
        if (!a.time || !b.time) return 0;
        const timeA = a.time.replace(':', '');
        const timeB = b.time.replace(':', '');
        return timeA.localeCompare(timeB);
      });

      // Calculate center point from all locations
      const center = {
        lat:
          locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length,
        lng:
          locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length,
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

      // Add markers for each location
      const markers: any[] = [];
      const infoWindows: any[] = [];

      sortedLocations.forEach((location, index) => {
        const isVineyard = location.type === 'vineyard';

        const marker = new window.google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map: mapInstance,
          title: location.name,
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
            <div style="padding: 12px; min-width: 250px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${
                location.name
              }</h3>
              ${
                isVineyard && location.data.g
                  ? `
                <div style="display: flex; align-items: center; margin-bottom: 6px; color: #6b7280; font-size: 14px;">
                  <span style="margin-right: 6px;">⭐</span>
                  <span>${location.data.g} (${
                      location.data.g_ratig_user || 'Google Reviews'
                    })</span>
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
                  <span>Scheduled for ${location.time}</span>
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
          infoWindows.forEach((iw) => iw.close());
          infoWindow.open(mapInstance, marker);
        });

        markers.push(marker);
        infoWindows.push(infoWindow);
      });

      // Create route between locations if there are multiple
      if (sortedLocations.length > 1) {
        const directionsService = new window.google.maps.DirectionsService();
        const directionsRenderer = new window.google.maps.DirectionsRenderer({
          suppressMarkers: true, // We have our own custom markers
          polylineOptions: {
            strokeColor: '#10b981',
            strokeWeight: 6,
            strokeOpacity: 0.8,
          },
          panel: null,
        });

        directionsRenderer.setMap(mapInstance);

        // Function to create a single route label for the entire route
        const createRouteLabel = (route: any) => {
          // Calculate total distance and duration
          const totalDistance = route.legs.reduce(
            (total: number, leg: any) => total + leg.distance.value,
            0
          );
          const totalDuration = route.legs.reduce(
            (total: number, leg: any) => total + leg.duration.value,
            0
          );

          // Find the center point along the actual route path
          let midPoint;

          try {
            // Find a point along the first leg (between 1st and 2nd location)
            const firstLeg = route.legs[0];

            if (firstLeg && firstLeg.steps && firstLeg.steps.length > 0) {
              // Get a step closer to the 2nd location (75% along the first leg)
              const stepIndex = Math.floor(firstLeg.steps.length * 0.75);
              const middleStep = firstLeg.steps[stepIndex];

              if (middleStep && middleStep.start_location) {
                midPoint = middleStep.start_location;
              } else if (middleStep && middleStep.end_location) {
                midPoint = middleStep.end_location;
              } else {
                // Fallback to leg start
                midPoint = firstLeg.start_location;
              }
            } else if (firstLeg) {
              // If no steps, use the leg start (which is on the route)
              midPoint = firstLeg.start_location;
            } else {
              // Ultimate fallback (should never happen)
              console.warn('No route legs found');
              midPoint = route.legs[0].start_location;
            }
          } catch (error) {
            // Ultimate fallback - use first leg start
            console.warn('Error finding route position:', error);
            midPoint = route.legs[0].start_location;
          }

          // Create a custom overlay for the route label
          class RouteInfoOverlay extends window.google.maps.OverlayView {
            private position: any;
            private div: HTMLElement | null = null;
            private totalDistance: number;
            private totalDuration: number;

            constructor(
              position: any,
              totalDistance: number,
              totalDuration: number
            ) {
              super();
              this.position = position;
              this.totalDistance = totalDistance;
              this.totalDuration = totalDuration;
            }

            onAdd() {
              this.div = document.createElement('div');
              this.div.style.cssText = `
                position: absolute;
                background: #ffffff;
                border: 2px solid #10b981;
                border-radius: 12px;
                padding: 8px 12px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 12px;
                font-weight: 600;
                color: #047857;
                text-align: center;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
                white-space: nowrap;
                cursor: pointer;
                user-select: none;
                transform: translate(-50%, -50%);
                z-index: 1000;
                min-width: 100px;
                line-height: 1.3;
              `;

              this.div.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 4px; margin-bottom: 2px;">
                  <span style="font-size: 12px;">🚗</span>
                  <span>${Math.round(this.totalDuration / 60)} min</span>
                </div>
                <div style="font-size: 10px; color: #059669; margin-top: 1px;">
                  ${(this.totalDistance / 1000).toFixed(1)} km
                </div>
              `;

              // Add hover effects
              this.div.addEventListener('mouseenter', () => {
                if (this.div) {
                  this.div.style.backgroundColor = '#f0fdf4';
                  this.div.style.borderColor = '#059669';
                  this.div.style.transform =
                    'translate(-50%, -50%) scale(1.05)';
                  this.div.style.transition = 'all 0.2s ease';
                }
              });

              this.div.addEventListener('mouseleave', () => {
                if (this.div) {
                  this.div.style.backgroundColor = '#ffffff';
                  this.div.style.borderColor = '#10b981';
                  this.div.style.transform = 'translate(-50%, -50%) scale(1)';
                }
              });

              // Add click handler to show more details
              this.div.addEventListener('click', () => {
                const infoWindow = new window.google.maps.InfoWindow({
                  content: `
                    <div style="padding: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      <h4 style="margin: 0 0 8px 0; color: #047857; font-size: 14px;">Route Summary</h4>
                      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <span>⏱️</span>
                        <span style="font-weight: 600;">${Math.round(
                          this.totalDuration / 60
                        )} minutes</span>
                        <span style="color: #6b7280;">driving time</span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span>📏</span>
                        <span style="font-weight: 600;">${(
                          this.totalDistance / 1000
                        ).toFixed(1)} km</span>
                        <span style="color: #6b7280;">total distance</span>
                      </div>
                    </div>
                  `,
                  position: this.position,
                });
                infoWindow.open(mapInstance);
              });

              const panes = this.getPanes();
              if (panes) {
                panes.overlayLayer.appendChild(this.div);
              }
            }

            draw() {
              const overlayProjection = this.getProjection();
              if (overlayProjection && this.div) {
                const position = overlayProjection.fromLatLngToDivPixel(
                  this.position
                );
                if (position) {
                  this.div.style.left = position.x + 'px';
                  this.div.style.top = position.y + 'px';
                }
              }
            }

            onRemove() {
              if (this.div && this.div.parentNode) {
                this.div.parentNode.removeChild(this.div);
                this.div = null;
              }
            }
          }

          // Create and add the route info overlay
          const routeInfoOverlay = new RouteInfoOverlay(
            midPoint,
            totalDistance,
            totalDuration
          );
          routeInfoOverlay.setMap(mapInstance);
        };

        if (sortedLocations.length === 2) {
          // Direct route for 2 locations
          const request = {
            origin: {
              lat: sortedLocations[0].lat,
              lng: sortedLocations[0].lng,
            },
            destination: {
              lat: sortedLocations[1].lat,
              lng: sortedLocations[1].lng,
            },
            travelMode: window.google.maps.TravelMode.DRIVING,
            unitSystem: window.google.maps.UnitSystem.METRIC,
          };

          directionsService.route(request, (result: any, status: any) => {
            if (status === 'OK') {
              directionsRenderer.setDirections(result);

              // Create route label
              const route = result.routes[0];
              createRouteLabel(route);

              // Update route info
              const leg = route.legs[0];

              setRouteInfo({
                totalDistance: leg.distance.text,
                totalDuration: leg.duration.text,
                legs: [
                  { distance: leg.distance.text, duration: leg.duration.text },
                ],
              });
            }
          });
        } else if (sortedLocations.length > 2) {
          // Multi-stop route with waypoints
          const waypoints = sortedLocations.slice(1, -1).map((location) => ({
            location: { lat: location.lat, lng: location.lng },
            stopover: true,
          }));

          const request = {
            origin: {
              lat: sortedLocations[0].lat,
              lng: sortedLocations[0].lng,
            },
            destination: {
              lat: sortedLocations[sortedLocations.length - 1].lat,
              lng: sortedLocations[sortedLocations.length - 1].lng,
            },
            waypoints: waypoints,
            travelMode: window.google.maps.TravelMode.DRIVING,
            optimizeWaypoints: false,
            unitSystem: window.google.maps.UnitSystem.METRIC,
          };

          directionsService.route(request, (result: any, status: any) => {
            if (status === 'OK') {
              directionsRenderer.setDirections(result);

              // Create route label for multi-stop route
              const route = result.routes[0];
              createRouteLabel(route);

              // Calculate total travel time and distance
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
      if ('initMap' in window) {
        delete (window as any).initMap;
      }
    };
  }, [plan]);

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='h-12 w-12 animate-spin text-green-600 mx-auto mb-4' />
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>
            Loading Map
          </h2>
          <p className='text-gray-600'>Preparing your route...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center'>
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
    );
  }

  if (!plan || plan.vineyards.length === 0) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50'>
        <header className='border-b border-gray-200 bg-white/80 backdrop-blur-sm'>
          <div className='container mx-auto px-4 py-4'>
            <div className='flex justify-between items-center'>
              <div className='flex items-center space-x-3'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => router.back()}
                >
                  <ArrowLeft className='h-5 w-5' />
                </Button>
                <Navigation className='h-8 w-8 text-green-600' />
                <div>
                  <h1 className='text-2xl font-bold text-gray-900'>Map View</h1>
                  <p className='text-sm text-gray-600'>Your tour route</p>
                </div>
              </div>
              <UserMenu />
            </div>
          </div>
        </header>

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
      </div>
    );
  }

  // Prepare sorted locations for sidebar
  const allLocations: Array<{
    type: 'vineyard' | 'restaurant';
    name: string;
    time: string;
    offer?: any;
    data: any;
  }> = [];

  plan.vineyards.forEach((planVineyard) => {
    if (planVineyard.vineyard) {
      allLocations.push({
        type: 'vineyard',
        name: planVineyard.vineyard.vineyard || planVineyard.vineyard.name,
        time: planVineyard.time || '',
        offer: planVineyard.offer,
        data: planVineyard.vineyard,
      });
    }
  });

  if (plan.restaurant?.restaurant) {
    allLocations.push({
      type: 'restaurant',
      name:
        plan.restaurant.restaurant.restaurants ||
        plan.restaurant.restaurant.name,
      time: plan.restaurant.time || '',
      data: plan.restaurant.restaurant,
    });
  }

  const sortedLocations = allLocations.sort((a, b) => {
    if (!a.time || !b.time) return 0;
    const timeA = a.time.replace(':', '');
    const timeB = b.time.replace(':', '');
    return timeA.localeCompare(timeB);
  });

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50'>
      {/* Header */}
      <header className='border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center space-x-3'>
              <Button variant='ghost' size='icon' onClick={() => router.back()}>
                <ArrowLeft className='h-5 w-5' />
              </Button>
              <Navigation className='h-8 w-8 text-green-600' />
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>
                  {plan.title || 'Your Vineyard Tour'}
                </h1>
                <p className='text-sm text-gray-600'>Interactive route map</p>
              </div>
            </div>
            <UserMenu />
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
              {sortedLocations.map((location, index) => {
                const isVineyard = location.type === 'vineyard';

                return (
                  <Card key={index} className='border-l-4 border-l-green-500'>
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
                            <Utensils className='h-4 w-4' />
                          )}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <h3 className='font-semibold text-gray-900 truncate'>
                            {location.name}
                          </h3>
                          {location.time && (
                            <div className='flex items-center text-sm text-gray-600 mt-1'>
                              <Clock className='h-3 w-3 mr-1' />
                              <span>{location.time}</span>
                            </div>
                          )}
                          {location.data.sub_region && (
                            <p className='text-xs text-gray-500 mt-1'>
                              {location.data.sub_region}
                            </p>
                          )}
                          {isVineyard && location.offer && (
                            <div className='mt-2 text-xs text-purple-600 bg-purple-50 rounded px-2 py-1'>
                              {location.offer.title} • €
                              {location.offer.cost_per_adult}/person
                            </div>
                          )}
                        </div>
                        <div className='flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold'>
                          {index + 1}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {routeInfo && (
              <div className='mt-6 pt-6 border-t border-gray-200'>
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

                <div className='space-y-2 mb-4'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-gray-600'>Total Stops:</span>
                    <span className='font-medium'>
                      {sortedLocations.length}
                    </span>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-gray-600'>Vineyards:</span>
                    <span className='font-medium'>
                      {
                        sortedLocations.filter(
                          (item) => item.type === 'vineyard'
                        ).length
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

                <Button
                  onClick={() => router.push('/explore/plan')}
                  className='w-full bg-green-600 hover:bg-green-700 text-white'
                >
                  Back to Plan
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
