import { create } from 'zustand';
import { apiClient, User, AuthTokens, LoginRequest, RegisterRequest } from '@shop-builder/shared';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (data: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<{ user: User; tokens: AuthTokens }>('/auth/login', data);
      apiClient.setTokens(response.tokens);
      set({ user: response.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка входа';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<{ user: User; tokens: AuthTokens }>('/auth/register', data);
      apiClient.setTokens(response.tokens);
      set({ user: response.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка регистрации';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    apiClient.clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      set({ isLoading: false });
      return;
    }

    try {
      const user = await apiClient.get<User>('/auth/me');
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      apiClient.clearTokens();
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));