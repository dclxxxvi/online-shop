import { create } from 'zustand';
import { apiClient, Product, CursorPaginatedResponse } from '@shop-builder/shared';

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
	cursor: Product['id'] | null;
	hasNext: boolean;
	isLoading: boolean;
	isSaving: boolean;
	error: string | null;
	total: number;

	fetchProducts: (storeId: string, search?: string) => Promise<void>;
	fetchProduct: (storeId: string, id: string) => Promise<void>;
	createProduct: (storeId: string, data: CreateProductData) => Promise<Product>;
	updateProduct: (storeId: string, id: string, data: UpdateProductData) => Promise<Product>;
	deleteProduct: (storeId: string, id: string) => Promise<void>;
	setCurrentProduct: (product: Product | null) => void;
	clearError: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
	products: [],
	currentProduct: null,
	cursor: null,
	hasNext: false,
	isLoading: false,
	isSaving: false,
	error: null,
	total: 0,

	fetchProducts: async (storeId: string, search?: string) => {
		set({ isLoading: true, error: null });
		try {
			const cursor = get().cursor;
			const params: Record<string, unknown> = { limit: 30 };
			if (search) params.search = search;
			if (cursor) params.cursor = cursor;
			const response = await apiClient.get<CursorPaginatedResponse<Product>>(
				`/stores/${storeId}/products`,
				params,
			);
			const oldData = get().products;
			set({
				products: [...oldData, ...response.data],
				total: response.total,
				isLoading: false,
				cursor: response.nextCursor,
				hasNext: response.hasNext,
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
				data,
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
