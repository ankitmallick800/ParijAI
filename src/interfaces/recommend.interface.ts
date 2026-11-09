export interface PlaceLocation {
  lat: number;
  lng: number;
}

export interface PlaceRecommendation {
  name: string;
  description: string;
  category: string;
  location: PlaceLocation;
  estimatedCostPerPerson: number;
  estimatedTimeToSpend: number;
  rating: number;
  reasonToVisit: string;
  seasonalNote?: string;
  festiveRelevance?: string;
  tags: string[];
  score: number;
  imageSearchQuery?: string;
}

export interface RouteOption {
  mode: string;
  duration: number;
  estimatedCost: number;
  distance: number;
  steps: string[];
  localTip?: string;
  recommended: boolean;
}

export interface ItineraryItem {
  order: number;
  place: PlaceRecommendation;
  route?: RouteOption;
  estimatedArrival?: string;
  estimatedDeparture?: string;
}

export interface BudgetBreakdown {
  category: string;
  amount: number;
}

export interface AggregatedResponse {
  summary: string;
  itinerary: ItineraryItem[];
  totalEstimatedCost: number;
  totalEstimatedTime: number;
  budgetBreakdown: BudgetBreakdown[];
  tips: string[];
}

export interface PlacesResponse {
  success: boolean;
  data: PlaceRecommendation[];
}

export interface RoutesResponse {
  success: boolean;
  data: Record<string, RouteOption[]>;
}

export interface AggregateResponseData {
  success: boolean;
  data: AggregatedResponse;
}
