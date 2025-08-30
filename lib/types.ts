export interface Vineyard {
  id: string;
  name: string;
  description: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  rating: number;
  reviewCount: number;
  images: string[];
  pricePerPerson: number;
  availableTimes: string[];
  tourTypes: string[];
  features: string[];
  language: string[];
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  rating: number;
  reviewCount: number;
  cuisine: string;
  priceRange: string;
  phone: string;
  website?: string;
  images: string[];
  distanceFromLocation?: string;
}

export interface ItineraryItem {
  id: string;
  type: 'vineyard' | 'restaurant';
  data: Vineyard | Restaurant;
  time: string;
  duration?: string;
}

export interface Itinerary {
  id: string;
  items: ItineraryItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanOption {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: {
    vineyardSelection: string;
    lunchSuggestion: string;
    dinnerSuggestion: string;
    mapView: boolean;
    liveAvailability: boolean | string;
    planSaved: string;
    pdfDownload: boolean | string;
    curatedOffers: boolean | string;
    premiumOffers: boolean | string;
    wineHotelBnB: boolean | string;
    wineRatings: boolean | string;
    aiAccess: boolean | string;
    accessToQA: boolean;
    savedSelections: string;
    qualityRatings: boolean;
    planDownload: string;
  };
  popular?: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  autoRenew: boolean;
}
