import { create } from 'zustand';
import { apiClient, Store, PaginatedResponse } from '@shop-builder/shared';

interface StoreState {
  stores: Store[];
  currentStore: Store | null;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  fetchStores: (page?: number) => Promise<void>;
  fetchStore: (id: string) => Promise<void>;
  createStore: (data: { name: string; subdomain: string }) => Promise<Store>;
  updateStore: (id: string, data: Partial<Store>) => Promise<void>;
  deleteStore: (id: string) => Promise<void>;
  setCurrentStore: (store: Store | null) => void;
}

export const useStoreStore = create<StoreState>((set) => ({
  stores: [],
  currentStore: null,
  isLoading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,

  fetchStores: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<PaginatedResponse<Store>>('/stores', {
        page,
        limit: 10,
      });
      set({
        stores: response.data,
        totalPages: response.totalPages,
        currentPage: response.page,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка загрузки магазинов';
      set({ error: message, isLoading: false });
    }
  },

  fetchStore: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const store = await apiClient.get<Store>(`/stores/${id}`);
      set({ currentStore: store, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка загрузки магазина';
      set({ error: message, isLoading: false });
    }
  },

  createStore: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const store = await apiClient.post<Store>('/stores', data);
      set((state) => ({
        stores: [store, ...state.stores],
        isLoading: false,
      }));
      return store;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка создания магазина';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateStore: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedStore = await apiClient.patch<Store>(`/stores/${id}`, data);
      set((state) => ({
        stores: state.stores.map((s) => (s.id === id ? updatedStore : s)),
        currentStore: state.currentStore?.id === id ? updatedStore : state.currentStore,
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка обновления магазина';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteStore: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/stores/${id}`);
      set((state) => ({
        stores: state.stores.filter((s) => s.id !== id),
        currentStore: state.currentStore?.id === id ? null : state.currentStore,
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка удаления магазина';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  setCurrentStore: (store) => set({ currentStore: store }),
}));