import { apiClient } from './api';
import { DeliveryQuote, ApiResponse } from '../types';

export const deliveryService = {
  async getQuote(address: string, latitude: number, longitude: number): Promise<DeliveryQuote> {
    const response = await apiClient.post<ApiResponse<DeliveryQuote>>('/delivery/quote', {
      address,
      latitude,
      longitude,
    });
    return response.data.data;
  },
};
