import { apiClient } from './api';
import { PlaceSuggestion, PlaceDetails, ApiResponse } from '../types';

export const placesService = {
  async autocomplete(input: string, sessionToken: string): Promise<PlaceSuggestion[]> {
    const query = new URLSearchParams({ input, sessionToken });
    const response = await apiClient.get<ApiResponse<PlaceSuggestion[]>>(`/places/autocomplete?${query}`);
    return response.data.data;
  },

  async getDetails(placeId: string, sessionToken: string): Promise<PlaceDetails> {
    const query = new URLSearchParams({ placeId, sessionToken });
    const response = await apiClient.get<ApiResponse<PlaceDetails>>(`/places/details?${query}`);
    return response.data.data;
  },
};
