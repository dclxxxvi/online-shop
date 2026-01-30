import { create } from 'zustand';
import { apiClient, Product, PaginatedResponse } from '@shop-builder/shared';

interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  images?: string[];
  inventory?: number;
  categoryId?: string;
  isActive?: boolean;
}

interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  images?: string[];
  inventory?: number;
  categoryId?: string;
  isActive?: boolean;
}

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  total: number;

  fetchProducts: (storeId: string, page?: number) => Promise<void>;
  fetchProduct: (storeId: string, id: string) => Promise<void>;
  createProduct: (storeId: string, data: CreateProductData) => Promise<Product>;
  updateProduct: (storeId: string, id: string, data: UpdateProductData) => Promise<Product>;
  deleteProduct: (storeId: string, id: string) => Promise<void>;
  setCurrentProduct: (product: Product | null) => void;
  clearError: () => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  currentProduct: null,
  isLoading: false,
  isSaving: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
  total: 0,

  fetchProducts: async (storeId: string, page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<PaginatedResponse<Product>>(
        `/stores/${storeId}/products`,
        { page, limit: 10 }
      );
      set({
        products: response.data,
        totalPages: response.totalPages,
        currentPage: response.page,
        total: response.total,
        isLoading: false,
      });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Ошибка загрузки товаров';
      set({ error: message, isLoading: false });
    }
  },

  fetchProduct: async (storeId: string, id: string) => {
    set({ isLoading: true, error: null });
    try {
      const product = await apiClient.get<Product>(`/stores/${storeId}/products/${id}`);
      set({ currentProduct: product, isLoading: false });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Ошибка загрузки товара';
      set({ error: message, isLoading: false });
    }
  },

  createProduct: async (storeId: string, data: CreateProductData) => {
    set({ isSaving: true, error: null });
    try {
      const product = await apiClient.post<Product>(`/stores/${storeId}/products`, data);
      set((state) => ({
        products: [product, ...state.products],
        total: state.total + 1,
        isSaving: false,
      }));
      return product;
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Ошибка создания товара';
      set({ error: message, isSaving: false });
      throw error;
    }
  },

  updateProduct: async (storeId: string, id: string, data: UpdateProductData) => {
    set({ isSaving: true, error: null });
    try {
      const updatedProduct = await apiClient.patch<Product>(
        `/stores/${storeId}/products/${id}`,
        data
      );
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? updatedProduct : p)),
        currentProduct: state.currentProduct?.id === id ? updatedProduct : state.currentProduct,
        isSaving: false,
      }));
      return updatedProduct;
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Ошибка обновления товара';
      set({ error: message, isSaving: false });
      throw error;
    }
  },

  deleteProduct: async (storeId: string, id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/stores/${storeId}/products/${id}`);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        currentProduct: state.currentProduct?.id === id ? null : state.currentProduct,
        total: state.total - 1,
        isLoading: false,
      }));
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Ошибка удаления товара';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  setCurrentProduct: (product) => set({ currentProduct: product }),

  clearError: () => set({ error: null }),
}));
