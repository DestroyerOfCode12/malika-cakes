import { apiClient } from './api';
import { LoginRequest, LoginResponse, AuthUser } from '../types';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  async verifyToken(token: string) {
    const response = await apiClient.post('/auth/verify-token', {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  setToken(token: string, user: AuthUser) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  getUser(): AuthUser | null {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
