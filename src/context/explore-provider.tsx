import type { ReactNode } from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { clampDuration, type ExploreFormData, type RecommendRequest } from "@/schemas/explore.schema";
import type { AggregatedResponse, PlaceRecommendation, RouteOption } from "@/interfaces/recommend.interface";
import { ExploreContext, initialState, SESSION_KEY } from "./explore.context";
import type { ExploreState } from "./explore.context";

export function ExploreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ExploreState>(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<ExploreState>;
        const minutes = parsed.formData?.time?.[0];
        return {
          ...initialState,
          ...parsed,
          formData: {
            ...initialState.formData,
            ...parsed.formData,
            time: [clampDuration(typeof minutes === "number" ? minutes : 180)],
          },
        };
      } catch (e) {
        console.error("Failed to parse explore state from sessionStorage", e);
      }
    }
    return initialState;
  });

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  }, [state]);

  const setFormData = useCallback((formData: ExploreFormData) =>
    setState(s => ({ ...s, formData })), []);

  const setLocation = useCallback((location: { lat: number; lng: number } | null) =>
    setState(s => ({ ...s, location })), []);

  const setResolvedCity = useCallback((resolvedCity: string) =>
    setState(s => ({ ...s, resolvedCity })), []);

  const setSourceLocation = useCallback((sourceLocation: { lat: number; lng: number } | null) =>
    setState(s => ({ ...s, sourceLocation })), []);

  const setSourceCity = useCallback((sourceCity: string) =>
    setState(s => ({ ...s, sourceCity })), []);

  const setPlaces = useCallback((places: PlaceRecommendation[]) =>
    setState(s => ({ ...s, places })), []);

  const setSelectedPlaces = useCallback((selectedPlaces: string[]) =>
    setState(s => ({ ...s, selectedPlaces })), []);

  const setRoutes = useCallback((routes: Record<string, RouteOption[]>) =>
    setState(s => ({ ...s, routes })), []);

  const setSelectedRoutes = useCallback((selectedRoutes: Record<string, string>) =>
    setState(s => ({ ...s, selectedRoutes })), []);

  const setSavedRequest = useCallback((savedRequest: RecommendRequest) =>
    setState(s => ({ ...s, savedRequest })), []);

  const setItinerary = useCallback((itinerary: AggregatedResponse) =>
    setState(s => ({ ...s, itinerary })), []);

  const resetWizard = useCallback(() => {
    setState(initialState);
  }, []);

  const value = useMemo(() => ({
    ...state,
    setFormData,
    setLocation,
    setResolvedCity,
    setSourceLocation,
    setSourceCity,
    setPlaces,
    setSelectedPlaces,
    setRoutes,
    setSelectedRoutes,
    setSavedRequest,
    setItinerary,
    resetWizard,
  }), [
    state,
    setFormData,
    setLocation,
    setResolvedCity,
    setSourceLocation,
    setSourceCity,
    setPlaces,
    setSelectedPlaces,
    setRoutes,
    setSelectedRoutes,
    setSavedRequest,
    setItinerary,
    resetWizard
  ]);

  return (
    <ExploreContext.Provider value={value}>
      {children}
    </ExploreContext.Provider>
  );
}
