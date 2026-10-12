import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItemResponse } from '@/types';
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart as clearCartApi,
  mergeGuestCart as mergeGuestCartApi,
} from '@/lib/api/cart';
import {
  calculateOptimisticAdd,
  calculateOptimisticRemove,
  mergeAddCartResponse,
  mergeRemoveCartResponse,
  mergeServerAndLocalCart,
} from './cart-store.helpers';

export interface CartState {
  items: CartItemResponse[];
  isLoading: boolean;
  isDrawerOpen: boolean;
  error: string | null;
  hasHydrated: boolean;

  setHasHydrated: (hasHydrated: boolean) => void;
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

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      isDrawerOpen: false,
      error: null,
      hasHydrated: false,

      setHasHydrated: (hasHydrated: boolean) => set({ hasHydrated }),

      fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const serverItems = await getCart();
          const localItems = get().items;
          const merged = mergeServerAndLocalCart(serverItems, localItems);
          set({ items: merged, isLoading: false });
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : 'Sepet yüklenirken hata oluştu';
          set({ error: message, isLoading: false });
        }
      },

      addItem: async (productId: string, variantId: string, pieces = 1) => {
        const previousItems = get().items;
        const existingItem = previousItems.find(
          (i) => i.product_variant_id === variantId,
        );

        if (existingItem) {
          set({
            items: calculateOptimisticAdd(previousItems, variantId, pieces),
            error: null,
          });
        } else {
          set({ isLoading: true, error: null });
        }

        try {
          const apiItems = await addToCart({
            product_id: productId,
            product_variant_id: variantId,
            pieces,
          });

          const currentItems = get().items;
          const merged = mergeAddCartResponse(
            currentItems,
            apiItems,
            variantId,
          );
          const shouldOpen = !get().isDrawerOpen;

          set({
            items: merged,
            isLoading: false,
            ...(shouldOpen ? { isDrawerOpen: true } : {}),
          });
          return true;
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : 'Ürün sepete eklenemedi';
          set({ items: previousItems, error: message, isLoading: false });
          return false;
        }
      },

      removeItem: async (productId: string, variantId: string, pieces = 1) => {
        const previousItems = get().items;
        const targetItem = previousItems.find(
          (i) => i.product_variant_id === variantId,
        );

        if (targetItem) {
          set({
            items: calculateOptimisticRemove(previousItems, variantId, pieces),
            error: null,
          });
        }

        try {
          const apiItems = await removeFromCart({
            product_id: productId,
            product_variant_id: variantId,
            pieces,
          });

          const currentItems = get().items;
          const merged = mergeRemoveCartResponse(
            currentItems,
            apiItems,
            variantId,
            targetItem?.pieces,
            pieces,
          );

          set({ items: merged, isLoading: false });
          return true;
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : 'Ürün sepetten silinemedi';
          set({ items: previousItems, error: message, isLoading: false });
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
    }),
    {
      name: 'ojs-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
