'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { useSession } from 'next-auth/react';
import { Vineyard, Restaurant, Offer } from '@/lib/types-vineyard';

export interface TripVineyard {
  vineyard: Vineyard;
  offer?: Offer;
  time?: string;
}

export interface TripRestaurant {
  restaurant: Restaurant;
  time?: string;
}

export interface TripState {
  vineyards: TripVineyard[];
  restaurant: TripRestaurant | null;
}

interface TripContextType {
  trip: TripState;
  addVineyard: (vineyard: Vineyard, offer?: Offer) => boolean; // Returns false if limit reached
  addRestaurant: (restaurant: Restaurant) => void;
  removeVineyard: (vineyardId: string) => void;
  removeRestaurant: () => void;
  updateVineyardTime: (vineyardId: string, time: string) => void;
  updateRestaurantTime: (time: string) => void;
  clearTrip: () => void;
  savePlan: () => Promise<void>;
  loadPlan: () => Promise<void>;
  planId: string | null;
  hasUnsavedChanges: boolean;
  isStateSynced: () => boolean;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

const MAX_VINEYARDS = 3;

export function TripProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [trip, setTrip] = useState<TripState>({
    vineyards: [],
    restaurant: null,
  });
  const [planId, setPlanId] = useState<string | null>(null);
  const [savedState, setSavedState] = useState<TripState>({
    vineyards: [],
    restaurant: null,
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load saved plan on mount
  useEffect(() => {
    const loadSavedPlan = async () => {
      if (
        session?.user?.id &&
        trip.vineyards.length === 0 &&
        !trip.restaurant
      ) {
        try {
          await loadPlan();
        } catch (error) {
          console.error('Failed to load saved plan:', error);
        }
      }
    };

    loadSavedPlan();
  }, [session?.user?.id]);

  // Track changes to detect if state is synced with database
  useEffect(() => {
    const hasChanges = JSON.stringify(trip) !== JSON.stringify(savedState);
    setHasUnsavedChanges(hasChanges);
  }, [trip, savedState]);

  const addVineyard = (vineyard: Vineyard, offer?: Offer): boolean => {
    if (trip.vineyards.length >= MAX_VINEYARDS) {
      return false; // Cannot add more vineyards
    }

    // Check if vineyard is already added (handle both fresh and loaded data)
    const isAlreadyAdded = trip.vineyards.some(
      (v) =>
        v.vineyard.vineyard_id === vineyard.vineyard_id ||
        v.vineyard.vineyard === vineyard.vineyard
    );

    if (isAlreadyAdded) {
      return false; // Vineyard already added
    }

    setTrip((prev) => ({
      ...prev,
      vineyards: [...prev.vineyards, { vineyard, offer }],
    }));
    return true;
  };

  const addRestaurant = (restaurant: Restaurant) => {
    setTrip((prev) => ({
      ...prev,
      restaurant: { restaurant },
    }));
  };

  const removeVineyard = (vineyardId: string) => {
    setTrip((prev) => ({
      ...prev,
      vineyards: prev.vineyards.filter(
        (v) => v.vineyard.vineyard_id !== vineyardId
      ),
    }));
  };

  const removeRestaurant = () => {
    setTrip((prev) => ({
      ...prev,
      restaurant: null,
    }));
  };

  const updateVineyardTime = (vineyardId: string, time: string) => {
    setTrip((prev) => ({
      ...prev,
      vineyards: prev.vineyards.map((v) =>
        v.vineyard.vineyard_id === vineyardId ? { ...v, time } : v
      ),
    }));
  };

  const updateRestaurantTime = (time: string) => {
    setTrip((prev) => ({
      ...prev,
      restaurant: prev.restaurant ? { ...prev.restaurant, time } : null,
    }));
  };

  const clearTrip = () => {
    setTrip({
      vineyards: [],
      restaurant: null,
    });
    setSavedState({
      vineyards: [],
      restaurant: null,
    });
    setPlanId(null);
    setHasUnsavedChanges(false);
  };

  const savePlan = async () => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    if (trip.vineyards.length === 0) {
      return; // Nothing to save
    }

    try {
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vineyards: trip.vineyards,
          restaurant: trip.restaurant,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPlanId(data.data.plan.id);
        // Update saved state to reflect current state
        setSavedState({
          vineyards: [...trip.vineyards],
          restaurant: trip.restaurant ? { ...trip.restaurant } : null,
        });
        setHasUnsavedChanges(false);
      } else {
        throw new Error(data.message || 'Failed to save plan');
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      throw error;
    }
  };

  const loadPlan = useCallback(async () => {
    if (!session?.user?.id) {
      return;
    }

    try {
      // Check for any active plan (draft or confirmed)
      const response = await fetch('/api/plans?type=active');
      const data = await response.json();

      if (data.success && data.data.plan) {
        const plan = data.data.plan;

        // Convert plan data back to trip format
        const vineyards = plan.vineyards.map((v: any) => ({
          vineyard: v.vineyard,
          offer: v.offer,
          time: v.time,
        }));

        const restaurant = plan.restaurant
          ? {
              restaurant: plan.restaurant.restaurant,
              time: plan.restaurant.time,
            }
          : null;

        setTrip({
          vineyards,
          restaurant,
        });

        if (plan.status === 'draft') {
          // Draft plan - set as saved state
          setSavedState({
            vineyards: [...vineyards],
            restaurant: restaurant ? { ...restaurant } : null,
          });
          setPlanId(plan.id);
          setHasUnsavedChanges(false);
        } else {
          // Confirmed plan - load data but mark as unsaved to allow updates
          setSavedState({
            vineyards: [],
            restaurant: null,
          });
          setPlanId(null); // No draft plan ID yet
          setHasUnsavedChanges(true);
        }
      }
    } catch (error) {
      console.error('Error loading plan:', error);
    }
  }, [session?.user?.id]);

  // Check if current state is synced with database
  const isStateSynced = useCallback(() => {
    return !hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  return (
    <TripContext.Provider
      value={{
        trip,
        addVineyard,
        addRestaurant,
        removeVineyard,
        removeRestaurant,
        updateVineyardTime,
        updateRestaurantTime,
        clearTrip,
        savePlan,
        loadPlan,
        planId,
        hasUnsavedChanges,
        isStateSynced,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
}
