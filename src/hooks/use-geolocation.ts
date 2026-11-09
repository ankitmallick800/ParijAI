import { useState } from "react";
import type { PlaceLocation } from "@/interfaces/recommend.interface";

interface GeolocationState {
  location: PlaceLocation | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: false,
  });

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setState({
        location: null,
        error: "Geolocation is not supported by your browser",
        loading: false,
      });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          error: null,
          loading: false,
        });
      },
      (error) => {
        setState({
          location: null,
          error: error.message,
          loading: false,
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return { ...state, requestLocation };
}
