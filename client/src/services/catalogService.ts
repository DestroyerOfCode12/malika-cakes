import { apiClient } from './api';
import { CatalogSize, CatalogFlavor, CatalogFilling, CatalogTopper } from '../types';

interface CatalogResponse<T> {
  data: T[];
  count: number;
}

export const catalogService = {
  async getSizes(): Promise<CatalogSize[]> {
    const response = await apiClient.get<CatalogResponse<CatalogSize>>('/catalog/sizes');
    return response.data.data;
  },

  async getFlavors(): Promise<CatalogFlavor[]> {
    const response = await apiClient.get<CatalogResponse<CatalogFlavor>>('/catalog/flavors');
    return response.data.data;
  },

  async getFillings(): Promise<CatalogFilling[]> {
    const response = await apiClient.get<CatalogResponse<CatalogFilling>>('/catalog/fillings');
    return response.data.data;
  },

  async getToppers(): Promise<CatalogTopper[]> {
    const response = await apiClient.get<CatalogResponse<CatalogTopper>>('/catalog/toppers');
    return response.data.data;
  },
};
