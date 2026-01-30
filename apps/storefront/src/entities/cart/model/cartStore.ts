import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem, Order, OrderCustomer, apiClient } from '@shop-builder/shared';

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Checkout state
  isCheckoutOpen: boolean;
  isSubmitting: boolean;
  orderError: string | null;
  lastOrder: Order | null;

  // Cart actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (isOpen: boolean) => void;
  getTotal: () => number;
  getItemCount: () => number;

  // Checkout actions
  setCheckoutOpen: (isOpen: boolean) => void;
  submitOrder: (storeId: string, customer: OrderCustomer) => Promise<boolean>;
  clearLastOrder: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      // Checkout state
      isCheckoutOpen: false,
      isSubmitting: false,
      orderError: null,
      lastOrder: null,

      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.product.id === product.id);

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { product, quantity }],
          };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      setCartOpen: (isOpen: boolean) => set({ isOpen }),

      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },

      // Checkout actions
      setCheckoutOpen: (isOpen: boolean) => set({ isCheckoutOpen: isOpen }),

      submitOrder: async (storeId: string, customer: OrderCustomer) => {
        const { items, getTotal, clearCart } = get();

        if (items.length === 0) {
          set({ orderError: 'Корзина пуста' });
          return false;
        }

        set({ isSubmitting: true, orderError: null });

        try {
          const orderItems = items.map((item) => ({
            productId: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.images[0],
          }));

          const order = await apiClient.post<Order>(`/stores/${storeId}/orders`, {
            items: orderItems,
            total: getTotal(),
            customer,
          });

          set({
            lastOrder: order,
            isSubmitting: false,
            isCheckoutOpen: false,
          });

          clearCart();
          return true;
        } catch (error: any) {
          set({
            orderError: error?.response?.data?.message || 'Не удалось оформить заказ',
            isSubmitting: false,
          });
          return false;
        }
      },

      clearLastOrder: () => set({ lastOrder: null }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
