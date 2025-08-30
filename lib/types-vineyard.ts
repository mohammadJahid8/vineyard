export interface Vineyard {
  vineyard_id: string;
  vineyard: string;
  region: string;
  sub_region: string;
  type: string;
  g: number;
  g_ratig_user: string;
  lowest_cost_per_adult: number;
  highest_cost_per_adult: number;
  reason_1?: string;
  reason_2?: string;
  reason_3?: string;
  reason_4?: string;
  reason_5?: string;
  image_url?: string;
  maplink?: string;
  tasting_only?: boolean;
  tour_and_tasting?: boolean;
  pairing_and_lunch?: boolean;
  vine_experience?: boolean;
  masterclass_workshop?: boolean;
}

export interface Offer {
  vineyard_id: string;
  title: string;
  experience: string;
  cost_per_adult: number;
  duration: string;
}

export interface FilterState {
  area: string;
  type: string;
  cost: string;
  experience: string[];
  search: string;
}

export interface Restaurant {
  id: string;
  region: string;
  sub_region: string;
  actual_type: string;
  approx_google_type: string;
  restaurants: string;
  gkp_link: string;
  g_rating: number;
  open_days: string;
  bracket: string;
  avg_est_lunch_cost: number;
  ta_link?: string;
  ta_rating?: number;
  dinner_tf?: boolean;
  open_days_1?: string;
  bracket_1?: string;
  avg_dinner_cost?: number;
  latitude: number;
  longitude: number;
  image_url?: string;
}

export interface RestaurantFilterState {
  area: string;
  type: string;
  cost: string;
  rating: string;
  search: string;
  distance: string;
  startingPoint: string;
}