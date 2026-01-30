import { create } from 'zustand';
import { apiClient, Order, OrderStatus, PaginatedResponse } from '@shop-builder/shared';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  total: number;

  fetchOrders: (storeId: string, page?: number) => Promise<void>;
  fetchOrder: (storeId: string, id: string) => Promise<void>;
  updateOrderStatus: (storeId: string, id: string, status: OrderStatus) => Promise<void>;
  setCurrentOrder: (order: Order | null) => void;
  clearError: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  isUpdating: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
  total: 0,

  fetchOrders: async (storeId: string, page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<PaginatedResponse<Order>>(
        `/stores/${storeId}/orders`,
        { page, limit: 10 }
      );
      set({
        orders: response.data,
        totalPages: response.totalPages,
        currentPage: response.page,
        total: response.total,
        isLoading: false,
      });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Ошибка загрузки заказов';
      set({ error: message, isLoading: false });
    }
  },

  fetchOrder: async (storeId: string, id: string) => {
    set({ isLoading: true, error: null });
    try {
      const order = await apiClient.get<Order>(`/stores/${storeId}/orders/${id}`);
      set({ currentOrder: order, isLoading: false });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Ошибка загрузки заказа';
      set({ error: message, isLoading: false });
    }
  },

  updateOrderStatus: async (storeId: string, id: string, status: OrderStatus) => {
    set({ isUpdating: true, error: null });
    try {
      const updatedOrder = await apiClient.patch<Order>(
        `/stores/${storeId}/orders/${id}/status`,
        { status }
      );
      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? updatedOrder : o)),
        currentOrder: state.currentOrder?.id === id ? updatedOrder : state.currentOrder,
        isUpdating: false,
      }));
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Ошибка обновления статуса';
      set({ error: message, isUpdating: false });
      throw error;
    }
  },

  setCurrentOrder: (order) => set({ currentOrder: order }),

  clearError: () => set({ error: null }),
}));
