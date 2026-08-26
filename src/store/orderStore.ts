import { create } from 'zustand'
import { orderApi } from '@/services/order'
import type {
    Order,
    PaymentSettings,
    ShipmentFee,
    CompleteShoppingRequest
} from '@/types/order'

interface OrderState {
    orders: Order[]
    selectedOrder: Order | null
    paymentSettings: PaymentSettings | null
    shipmentFee: ShipmentFee | null
    isLoading: boolean
    error: string | null

    fetchOrders: () => Promise<void>
    fetchOrderById: (orderId: string) => Promise<void>
    fetchPaymentSettings: () => Promise<void>
    fetchShipmentFee: () => Promise<void>
    completeShopping: (data: CompleteShoppingRequest) => Promise<boolean>
    clearError: () => void
}

export const useOrderStore = create<OrderState>((set) => ({
    orders: [],
    selectedOrder: null,
    paymentSettings: null,
    shipmentFee: null,
    isLoading: false,
    error: null,

    fetchOrders: async () => {
        set({ isLoading: true, error: null })

        try {
            const response = await orderApi.getOrders() as any
            console.log('📦 Orders API Response:', response)
            const orders = response.data || response || []
            console.log('📦 Parsed Orders:', orders)
            set({ orders, isLoading: false })
        } catch (error) {
            console.error('Siparişler yüklenemedi:', error)
            set({ error: 'Siparişler yüklenirken hata oluştu', isLoading: false })
        }
    },

    fetchOrderById: async (orderId: string) => {
        set({ isLoading: true, error: null })

        try {
            const response = await orderApi.getOrderById(orderId) as any
            const order = response.data || response
            set({ selectedOrder: order, isLoading: false })
        } catch (error) {
            console.error('Sipariş detayı yüklenemedi:', error)
            set({ error: 'Sipariş detayı yüklenirken hata oluştu', isLoading: false })
        }
    },

    fetchPaymentSettings: async () => {
        set({ isLoading: true, error: null })

        try {
            const response = await orderApi.getPaymentSettings() as any
            const settings = response.data || response
            set({ paymentSettings: settings, isLoading: false })
        } catch (error) {
            console.error('Ödeme ayarları yüklenemedi:', error)
            set({ error: 'Ödeme ayarları yüklenirken hata oluştu', isLoading: false })
        }
    },

    fetchShipmentFee: async () => {
        set({ isLoading: true, error: null })

        try {
            const response = await orderApi.getShipmentFee() as any
            const fee = response.data || response
            set({ shipmentFee: fee, isLoading: false })
        } catch (error) {
            console.error('Kargo ücreti hesaplanamadı:', error)
            set({ error: 'Kargo ücreti hesaplanırken hata oluştu', isLoading: false })
        }
    },

    completeShopping: async (data: CompleteShoppingRequest) => {
        set({ isLoading: true, error: null })

        try {
            const response = await orderApi.completeShopping(data) as any
            const newOrder = response.data || response

            set((state) => ({
                orders: [newOrder, ...state.orders],
                selectedOrder: newOrder,
                isLoading: false
            }))

            return true
        } catch (error) {
            console.error('Sipariş tamamlanamadı:', error)
            set({ error: 'Sipariş tamamlanırken hata oluştu', isLoading: false })
            return false
        }
    },

    clearError: () => set({ error: null })
}))
