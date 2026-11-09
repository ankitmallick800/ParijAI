import { axiosInstance } from "../services/api";
import { recommendQueries } from "../react-query/recommend.queries";
import { 
  type PlacesResponse, 
  type RoutesResponse, 
  type AggregateResponseData 
} from "../interfaces/recommend.interface";
import {
  type RecommendRequest,
  type FetchRoutesRequest,
  type AggregateRequest,
} from "../schemas/explore.schema";

export async function getPlaces(data: RecommendRequest) {
  const response = await axiosInstance.post<PlacesResponse>(
    recommendQueries.getPlaces.endpoint,
    data
  );
  return response.data;
}

export async function getRoutes(data: FetchRoutesRequest) {
  const response = await axiosInstance.post<RoutesResponse>(
    recommendQueries.getRoutes.endpoint,
    data
  );
  return response.data;
}

export async function aggregate(data: AggregateRequest) {
  const response = await axiosInstance.post<AggregateResponseData>(
    recommendQueries.aggregate.endpoint,
    data
  );
  return response.data;
}
