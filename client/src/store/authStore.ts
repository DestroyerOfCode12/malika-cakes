import { create } from 'zustand';
import { AuthUser, LoginRequest } from '../types';
import { authService } from '../services/authService';

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;

  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoggedIn: false,
  loading: false,
  error: null,

  login: async (credentials: LoginRequest) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.login(credentials);
      authService.setToken(response.token, response.user);

      set({
        token: response.token,
        user: response.user,
        isLoggedIn: true,
        loading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      set({
        error: message,
        loading: false,
      });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      token: null,
      isLoggedIn: false,
      error: null,
    });
  },

  initialize: () => {
    const token = authService.getToken();
    const user = authService.getUser();

    if (token && user) {
      set({
        token,
        user,
        isLoggedIn: true,
      });
    }
  },
}));

// Initialize on store creation
useAuthStore.getState().initialize();
