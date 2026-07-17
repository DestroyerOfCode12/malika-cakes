import { apiClient } from './api';
import { Order, AdminDashboardStats, ApiResponse, PaginatedResponse } from '../types';

export interface CustomerWithStats {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string | null;
}

export interface OrderQueueParams {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const adminService = {
  async getDashboard(): Promise<{ data: AdminDashboardStats; recentOrders: Order[] }> {
    const response = await apiClient.get<{ data: AdminDashboardStats; recentOrders: Order[] }>('/admin/dashboard');
    return response.data;
  },

  async getOrders(params: OrderQueueParams = {}): Promise<PaginatedResponse<Order>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.status) query.set('status', params.status);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);
    const response = await apiClient.get<PaginatedResponse<Order>>(`/admin/orders?${query.toString()}`);
    return response.data;
  },

  async getOrder(id: string): Promise<Order> {
    const response = await apiClient.get<ApiResponse<Order>>(`/admin/orders/${id}`);
    return response.data.data;
  },

  async updateOrderStatus(
    id: string,
    status: string,
    notes?: string
  ): Promise<{ order: Order; deliveryDispatchError?: string }> {
    const response = await apiClient.patch<ApiResponse<Order> & { deliveryDispatchError?: string }>(
      `/admin/orders/${id}/status`,
      { status, notes }
    );
    return { order: response.data.data, deliveryDispatchError: response.data.deliveryDispatchError };
  },

  async updatePaymentStatus(id: string, paymentStatus: string): Promise<Order> {
    const response = await apiClient.patch<ApiResponse<Order>>(`/admin/orders/${id}/payment-status`, { paymentStatus });
    return response.data.data;
  },

  async getCustomers(page = 1, limit = 20): Promise<PaginatedResponse<CustomerWithStats>> {
    const response = await apiClient.get<PaginatedResponse<CustomerWithStats>>(
      `/admin/customers?page=${page}&limit=${limit}`
    );
    return response.data;
  },
};
