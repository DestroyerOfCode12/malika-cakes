import { apiClient } from './api';
import { Order, CreateOrderRequest, ApiResponse } from '../types';

export const orderService = {
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const response = await apiClient.post<ApiResponse<Order>>('/orders', data);
    return response.data.data;
  },

  async getOrder(id: string): Promise<Order> {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data.data;
  },

  async updateOrder(id: string, data: Partial<CreateOrderRequest>): Promise<Order> {
    const response = await apiClient.patch<ApiResponse<Order>>(`/orders/${id}`, data);
    return response.data.data;
  },

  async cancelOrder(id: string) {
    const response = await apiClient.delete(`/orders/${id}`);
    return response.data;
  },

  async lookupOrder(orderNumber: string, email: string): Promise<Order> {
    const query = new URLSearchParams({ orderNumber, email });
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/lookup?${query.toString()}`);
    return response.data.data;
  },
};
