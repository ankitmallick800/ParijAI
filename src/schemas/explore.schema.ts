import { z } from "zod";
import type { 
  PlaceLocation, 
  PlaceRecommendation, 
  RouteOption 
} from "@/interfaces/recommend.interface";

export const MIN_DURATION_MINUTES = 60;
export const MAX_DURATION_MINUTES = 14 * 24 * 60;

export function clampDuration(minutes: number) {
  if (!Number.isFinite(minutes)) return 180;
  const stepped = Math.round(minutes / 60) * 60;
  return Math.min(MAX_DURATION_MINUTES, Math.max(MIN_DURATION_MINUTES, stepped));
}

export const exploreSchema = z.object({
  cityQuery: z.string(),
  time: z.array(z.number().min(MIN_DURATION_MINUTES).max(MAX_DURATION_MINUTES)).length(1),
  budget: z.string().min(1, "Budget is required"),
  groupType: z.enum(["solo", "couple", "family", "friends"]),
  groupSize: z.string(),
  selectedCategories: z.array(z.string()),
});

export type ExploreFormData = z.infer<typeof exploreSchema>;

// API Request Types
export type GroupType = "solo" | "couple" | "family" | "friends";

export interface RecommendRequest {
  location: PlaceLocation;
  cityName?: string;
  availableTimeMinutes: number;
  budgetINR: number;
  groupType: GroupType;
  groupSize: number;
  preferences?: string[];
}

export interface FetchRoutesRequest {
  origin: PlaceLocation;
  selectedPlaces: { name: string; location: PlaceLocation }[];
}

export interface AggregateRequest {
  places: PlaceRecommendation[];
  routes: Record<string, RouteOption[]>;
  request: RecommendRequest;
}
