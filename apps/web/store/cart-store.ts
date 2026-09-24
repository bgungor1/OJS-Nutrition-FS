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

          if (serverItems.length > 0) {
            const serverMap = new Map(
              serverItems.map((item) => [item.product_variant_id, item]),
            );
            const preservedLocal = localItems.filter(
              (item) => !serverMap.has(item.product_variant_id),
            );
            set({ items: [...preservedLocal, ...serverItems], isLoading: false });
          } else {
            set({ items: localItems, isLoading: false });
          }
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
          const optimisticItems = previousItems.map((item) =>
            item.product_variant_id === variantId
              ? { ...item, pieces: item.pieces + pieces }
              : item,
          );
          set({ items: optimisticItems, error: null });
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
          const apiItemMap = new Map(
            apiItems.map((item) => [item.product_variant_id, item]),
          );

          const preservedItems = currentItems.filter(
            (item) =>
              item.product_variant_id !== variantId &&
              !apiItemMap.has(item.product_variant_id),
          );

          const merged = [...preservedItems, ...apiItems];

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
          const optimisticItems =
            targetItem.pieces <= pieces
              ? previousItems.filter((i) => i.product_variant_id !== variantId)
              : previousItems.map((i) =>
                i.product_variant_id === variantId
                  ? { ...i, pieces: i.pieces - pieces }
                  : i,
              );
          set({ items: optimisticItems, error: null });
        }

        try {
          const apiItems = await removeFromCart({
            product_id: productId,
            product_variant_id: variantId,
            pieces,
          });

          const currentItems = get().items;
          const apiItemMap = new Map(
            apiItems.map((item) => [item.product_variant_id, item]),
          );

          const isCompletelyRemoved =
            !apiItemMap.has(variantId) ||
            (targetItem !== undefined && targetItem.pieces <= pieces);

          const preservedItems = currentItems.filter((item) => {
            if (item.product_variant_id === variantId) {
              return !isCompletelyRemoved;
            }
            return !apiItemMap.has(item.product_variant_id);
          });

          const merged = [...preservedItems, ...apiItems];
          const deduplicatedMap = new Map<string, CartItemResponse>();
          for (const item of merged) {
            deduplicatedMap.set(item.product_variant_id, item);
          }

          set({ items: Array.from(deduplicatedMap.values()), isLoading: false });
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
