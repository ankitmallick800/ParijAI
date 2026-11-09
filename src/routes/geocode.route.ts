import { axiosInstance } from "../services/api";
import { geocodeQueries } from "../react-query/geocode.queries";
import type { 
  GeocodeForwardResponse, 
  GeocodeReverseResponse 
} from "../interfaces/geocode.interface";

export async function forward(query: string) {
  const response = await axiosInstance.post<GeocodeForwardResponse>(
    geocodeQueries.forward.endpoint,
    { query }
  );
  return response.data;
}

export async function reverse(lat: number, lng: number) {
  const response = await axiosInstance.post<GeocodeReverseResponse>(
    geocodeQueries.reverse.endpoint,
    { lat, lng }
  );
  return response.data;
}
