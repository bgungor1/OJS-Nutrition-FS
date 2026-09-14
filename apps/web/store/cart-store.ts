import { create } from 'zustand';
import type { CartItemResponse } from '@/types';
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart as clearCartApi,
  mergeGuestCart as mergeGuestCartApi,
} from '@/lib/api/cart';

export interface CartState {
  items: CartItemResponse[];
  isLoading: boolean;
  isDrawerOpen: boolean;
  error: string | null;

  fetchCart: () => Promise<void>;
  addItem: (
    productId: string,
    variantId: string,
    pieces?: number,
  ) => Promise<boolean>;
  removeItem: (
    productId: string,
    variantId: string,
    pieces?: number,
  ) => Promise<boolean>;
  clearCart: () => Promise<void>;
  mergeGuestCart: (token: string) => Promise<void>;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  resetError: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  isLoading: false,
  isDrawerOpen: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await getCart();
      set({ items, isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Sepet yüklenirken hata oluştu';
      set({ error: message, isLoading: false });
    }
  },

  addItem: async (productId: string, variantId: string, pieces = 1) => {
    set({ isLoading: true, error: null });
    try {
      const items = await addToCart({
        product_id: productId,
        product_variant_id: variantId,
        pieces,
      });
      set({ items, isLoading: false, isDrawerOpen: true });
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Ürün sepete eklenemedi';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  removeItem: async (productId: string, variantId: string, pieces = 1) => {
    set({ isLoading: true, error: null });
    try {
      const items = await removeFromCart({
        product_id: productId,
        product_variant_id: variantId,
        pieces,
      });
      set({ items, isLoading: false });
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Ürün sepetten silinemedi';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      await clearCartApi();
      set({ items: [], isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Sepet temizlenemedi';
      set({ error: message, isLoading: false });
    }
  },

  mergeGuestCart: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      const items = await mergeGuestCartApi(token);
      set({ items, isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Sepet birleştirilemedi';
      set({ error: message, isLoading: false });
    }
  },

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
  resetError: () => set({ error: null }),
}));
