import { create } from 'zustand';
import { apiClient, Store, Page } from '@shop-builder/shared';

interface StoreDataState {
  store: Store | null;
  page: Page | null;
  isLoading: boolean;
  error: string | null;
  fetchStoreData: (storeId: string, pageSlug?: string) => Promise<void>;
  fetchStoreBySubdomain: (subdomain: string, pageSlug?: string) => Promise<void>;
}

export const useStoreData = create<StoreDataState>((set) => ({
  store: null,
  page: null,
  isLoading: true,
  error: null,

  fetchStoreData: async (storeId: string, pageSlug = 'home') => {
    set({ isLoading: true, error: null });
    try {
      const [store, page] = await Promise.all([
        apiClient.get<Store>(`/stores/${storeId}/public`),
        apiClient.get<Page>(`/stores/${storeId}/pages/${pageSlug}`),
      ]);
      set({ store, page, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ошибка загрузки магазина';
      set({ error: message, isLoading: false });
    }
  },

  fetchStoreBySubdomain: async (subdomain: string, pageSlug = 'home') => {
    set({ isLoading: true, error: null });
    try {
      // First get store by subdomain
      const store = await apiClient.get<Store>(`/stores/subdomain/${subdomain}`);
      // Then get the page
      const page = await apiClient.get<Page>(`/stores/${store.id}/pages/${pageSlug}`);
      set({ store, page, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Магазин не найден';
      set({ error: message, isLoading: false });
    }
  },
}));
