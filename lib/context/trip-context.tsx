'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
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
  vineyard: TripVineyard | null;
  restaurant: TripRestaurant | null;
}

interface TripContextType {
  trip: TripState;
  addVineyard: (vineyard: Vineyard, offer?: Offer) => void;
  addRestaurant: (restaurant: Restaurant) => void;
  removeVineyard: () => void;
  removeRestaurant: () => void;
  updateVineyardTime: (time: string) => void;
  updateRestaurantTime: (time: string) => void;
  clearTrip: () => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const [trip, setTrip] = useState<TripState>({
    vineyard: null,
    restaurant: null,
  });

  const addVineyard = (vineyard: Vineyard, offer?: Offer) => {
    setTrip((prev) => ({
      ...prev,
      vineyard: { vineyard, offer },
    }));
  };

  const addRestaurant = (restaurant: Restaurant) => {
    setTrip((prev) => ({
      ...prev,
      restaurant: { restaurant },
    }));
  };

  const removeVineyard = () => {
    setTrip((prev) => ({
      ...prev,
      vineyard: null,
    }));
  };

  const removeRestaurant = () => {
    setTrip((prev) => ({
      ...prev,
      restaurant: null,
    }));
  };

  const updateVineyardTime = (time: string) => {
    setTrip((prev) => ({
      ...prev,
      vineyard: prev.vineyard ? { ...prev.vineyard, time } : null,
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
      vineyard: null,
      restaurant: null,
    });
  };

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
