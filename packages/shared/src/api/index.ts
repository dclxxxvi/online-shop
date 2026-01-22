import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiError, AuthTokens } from '../types';

// Use window.__API_URL__ for runtime config or default to localhost
const API_URL = (typeof window !== 'undefined' && (window as any).__API_URL__) || 'http://localhost:4000/api';

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const response = await this.refreshTokens(refreshToken);
              this.setTokens(response);

              // Retry original request
              const originalRequest = error.config;
              if (originalRequest && originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
                return this.client(originalRequest);
              }
            } catch {
              this.clearTokens();
              window.location.href = '/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setTokens(tokens: AuthTokens): void {
    this.accessToken = tokens.accessToken;
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  clearTokens(): void {
    this.accessToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  loadTokensFromStorage(): void {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      this.accessToken = accessToken;
    }
  }

  private async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const response = await axios.post<AuthTokens>(`${API_URL}/auth/refresh`, {
      refreshToken,
    });
    return response.data;
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }
}

export const apiClient = new ApiClient();

// Initialize tokens from storage
if (typeof window !== 'undefined') {
  apiClient.loadTokensFromStorage();
}
