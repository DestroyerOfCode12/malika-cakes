import { apiClient } from './api';
import { DeliveryQuote, ApiResponse } from '../types';

export const deliveryService = {
  async getQuote(address: string): Promise<DeliveryQuote> {
    const response = await apiClient.post<ApiResponse<DeliveryQuote>>('/delivery/quote', { address });
    return response.data.data;
  },
};
