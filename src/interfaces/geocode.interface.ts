export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

export interface GeocodeForwardRequest {
  query: string;
}

export interface GeocodeReverseRequest {
  lat: number;
  lng: number;
}

export interface GeocodeForwardResponse {
  success: boolean;
  data: GeocodeResult;
}

export interface GeocodeReverseResponse {
  success: boolean;
  data: {
    cityName: string;
  };
}
