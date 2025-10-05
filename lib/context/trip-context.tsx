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
  addVineyard: (vineyard: Vineyard, offer?: Offer) => Promise<boolean>; // Returns false if limit reached
  addRestaurant: (restaurant: Restaurant) => Promise<void>;
  removeVineyard: (vineyardId: string) => Promise<void>;
  removeRestaurant: () => Promise<void>;
  updateVineyardTime: (vineyardId: string, time: string) => Promise<void>;
  updateRestaurantTime: (time: string) => Promise<void>;
  updateVineyardOrder: (newOrder: TripVineyard[]) => Promise<void>;
  clearTrip: () => void;
  // savePlan: () => Promise<void>;
  loadPlan: () => Promise<void>;
  planId: string | null;
  hasUnsavedChanges: boolean;
  isStateSynced: () => boolean;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

const MAX_VINEYARDS = 10;

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

  const addVineyard = async (vineyard: Vineyard, offer?: Offer) => {
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

    const newTrip = {
      ...trip,
      vineyards: [...trip.vineyards, { vineyard, offer }],
    };

    setTrip(newTrip);

    // Auto-save with the new state
    if (session?.user?.id) {
      await savePlanWithState(newTrip).catch(console.error);
    }

    return true;
  };

  const addRestaurant = async (restaurant: Restaurant) => {
    const newTrip = {
      ...trip,
      restaurant: { restaurant },
    };

    setTrip(newTrip);

    // Auto-save with the new state
    if (session?.user?.id) {
      try {
        await savePlanWithState(newTrip);
      } catch (error) {
        console.error('Error saving plan after adding restaurant:', error);
      }
    }
  };

  const removeVineyard = async (vineyardId: string) => {
    // console.log('🚀 ~ removeVineyard ~ vineyardId:', vineyardId);
    const newTrip = {
      ...trip,
      vineyards: trip.vineyards.filter(
        (v) => v.vineyard.vineyard_id !== vineyardId
      ),
    };

    setTrip(newTrip);

    // Auto-save with the new state
    if (session?.user?.id) {
      try {
        await savePlanWithState(newTrip);
      } catch (error) {
        console.error('Error saving plan after removing vineyard:', error);
      }
    }
  };

  const removeRestaurant = async () => {
    const newTrip = {
      ...trip,
      restaurant: null,
    };

    setTrip(newTrip);

    // Auto-save with the new state
    if (session?.user?.id) {
      try {
        await savePlanWithState(newTrip);
      } catch (error) {
        console.error('Error saving plan after removing restaurant:', error);
      }
    }
  };

  const updateVineyardTime = async (vineyardId: string, time: string) => {
    const newTrip = {
      ...trip,
      vineyards: trip.vineyards.map((v) =>
        v.vineyard.vineyard_id === vineyardId ? { ...v, time } : v
      ),
    };

    setTrip(newTrip);

    // Auto-save with the new state
    if (session?.user?.id) {
      try {
        await savePlanWithState(newTrip);
      } catch (error) {
        console.error('Error saving plan after updating vineyard time:', error);
      }
    }
  };

  const updateRestaurantTime = async (time: string) => {
    const newTrip = {
      ...trip,
      restaurant: trip.restaurant ? { ...trip.restaurant, time } : null,
    };

    setTrip(newTrip);

    // Auto-save with the new state
    if (session?.user?.id) {
      try {
        await savePlanWithState(newTrip);
      } catch (error) {
        console.error(
          'Error saving plan after updating restaurant time:',
          error
        );
      }
    }
  };

  const updateVineyardOrder = async (newOrder: TripVineyard[]) => {
    const newTrip = {
      ...trip,
      vineyards: newOrder,
    };

    setTrip(newTrip);

    // Auto-save with the new state
    if (session?.user?.id) {
      try {
        await savePlanWithState(newTrip);
      } catch (error) {
        console.error(
          'Error saving plan after updating vineyard order:',
          error
        );
      }
    }
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

  const savePlanWithState = async (tripState: TripState) => {
    // console.log('🚀 ~ savePlanWithState ~ tripState:', tripState);
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    // if (tripState.vineyards.length === 0) {
    //   return; // Nothing to save
    // }

    try {
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vineyards: tripState.vineyards,
          restaurant: tripState.restaurant,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPlanId(data.data.plan.id);
        // Update saved state to reflect the saved state
        setSavedState({
          vineyards: [...tripState.vineyards],
          restaurant: tripState.restaurant ? { ...tripState.restaurant } : null,
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

        if (plan) {
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
        updateVineyardOrder,
        clearTrip,
        // savePlan,
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
