
import { create } from 'zustand'
import { persist, type PersistStorage, type StorageValue } from 'zustand/middleware'
import { cartApi } from '@/services/cart'
import { useAuthStore } from '@/store/authStore'

interface CartItem {
  id: string              // Benzersiz sepet öğesi ID'si
  name: string            // Ürün adı (UI için)
  price: number           // Birim fiyat
  quantity: number        // Adet
  image: string           // Ürün görseli URL'i
  flavor?: string         // Aroma (opsiyonel)
  size?: string           // Boyut (opsiyonel)
  product_id?: number     // API için ürün ID
  product_variant_id?: string  // API için varyant ID
}

interface CartState {
  items: CartItem[]
  isLoading: boolean
  error: string | null

  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateItemQuantity: (id: string, quantity: number) => void
  clearCart: () => void

  getTotalItems: () => number
  getTotalPrice: () => number

  setCartOpen: (isOpen: boolean) => void

  fetchCart: () => Promise<void>           // API'den sepeti çek
  syncAddToCart: (item: CartItem) => Promise<boolean>     // API'ye ekle
  syncRemoveFromCart: (item: CartItem) => Promise<boolean> // API'den sil
}

const cartStorage: PersistStorage<CartState> = {
  getItem: (name) => {
    const str = localStorage.getItem(name)
    if (!str) return null
    return JSON.parse(str) as StorageValue<CartState>
  },
  setItem: (name, value) => {
    localStorage.setItem(name, JSON.stringify(value))
  },
  removeItem: (name) => {
    localStorage.removeItem(name)
  },
}


export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id)
          if (existingItem) {
            // Aynı ürün varsa quantity'yi artır
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: 1 }] }
        }),


      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      updateItemQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        })),


      clearCart: () => set({ items: [] }),

      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),


      getTotalPrice: () =>
        get().items.reduce((total, item) => total + item.price * item.quantity, 0),

      setCartOpen: (isOpen: boolean) => {
        console.log('Sepet açıldı/kapandı:', isOpen)
      },


      fetchCart: async () => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated

        if (!isAuthenticated) {
          return
        }

        set({ isLoading: true, error: null })

        try {
          const response = await cartApi.getCart() as any
          console.log('🛒 Cart API Response:', response)


          const cartItems = response.data || response || []
          const items: CartItem[] = cartItems.map((item: any) => ({
            id: item.id || `${item.product_id}-${item.product_variant_id}`,
            name: item.product?.name || 'Ürün',
            price: item.variant?.price || 0,
            quantity: item.pieces || 1,
            image: item.product?.photo || '',
            flavor: item.variant?.aroma,
            size: item.variant?.size,
            product_id: item.product_id,
            product_variant_id: item.product_variant_id,
          }))

          set({ items, isLoading: false })
        } catch (error) {
          console.error('Sepet yüklenemedi:', error)
          set({ error: 'Sepet yüklenirken hata oluştu', isLoading: false })
        }
      },

      syncAddToCart: async (item: CartItem) => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated

        get().addItem(item)

        if (!isAuthenticated) {
          return true
        }
        try {
          const requestBody = {
            product_id: String(item.product_id),
            product_variant_id: item.product_variant_id || '',
            pieces: 1,
          }
          await cartApi.addToCart(requestBody)
          return true
        } catch (error) {
          return false
        }
      },

      syncRemoveFromCart: async (item: CartItem) => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated
        get().removeItem(item.id)

        if (!isAuthenticated) {
          return true
        }

        // API'den sil
        try {
          await cartApi.removeFromCart({
            product_id: item.product_id || 0,
            product_variant_id: item.product_variant_id || '',
            pieces: item.quantity,
          })
          console.log('✅ Ürün API sepetinden silindi')
          return true
        } catch (error) {
          console.error('API sepetinden silinemedi:', error)
          return false
        }
      },
    }),
    {
      name: 'cart-storage',
      storage: cartStorage,
    }
  )
)
