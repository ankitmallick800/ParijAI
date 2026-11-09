import { useMutation } from "@tanstack/react-query";
import { recommendQueries } from "@/react-query/recommend.queries";
import { geocodeQueries } from "@/react-query/geocode.queries";
import { 
  getPlaces, 
  getRoutes, 
  aggregate 
} from "@/routes/recommend.route";
import { 
  forward, 
  reverse 
} from "@/routes/geocode.route";
import { 
  type PlaceRecommendation, 
  type RouteOption, 
  type AggregatedResponse, 
} from "@/interfaces/recommend.interface";
import {
  type RecommendRequest,
  type FetchRoutesRequest,
  type AggregateRequest,
} from "@/schemas/explore.schema";
import type { GeocodeResult } from "@/interfaces/geocode.interface";

export function useFindPlaces() {
  return useMutation<
    { success: boolean; data: PlaceRecommendation[] },
    Error,
    RecommendRequest
  >({
    mutationKey: recommendQueries.getPlaces.key,
    mutationFn: getPlaces,
  });
}

export function useFindRoutes() {
  return useMutation<
    { success: boolean; data: Record<string, RouteOption[]> },
    Error,
    FetchRoutesRequest
  >({
    mutationKey: recommendQueries.getRoutes.key,
    mutationFn: getRoutes,
  });
}

export function useAggregate() {
  return useMutation<
    { success: boolean; data: AggregatedResponse },
    Error,
    AggregateRequest
  >({
    mutationKey: recommendQueries.aggregate.key,
    mutationFn: aggregate,
  });
}

export function useGeocodeForward() {
  return useMutation<
    { success: boolean; data: GeocodeResult },
    Error,
    string
  >({
    mutationKey: geocodeQueries.forward.key,
    mutationFn: forward,
  });
}
export function useGeocodeReverse() {
  return useMutation<
    { success: boolean; data: { cityName: string } },
    Error,
    { lat: number; lng: number }
  >({
    mutationKey: geocodeQueries.reverse.key,
    mutationFn: ({ lat, lng }) => reverse(lat, lng),
  });
}
