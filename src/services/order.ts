import { apiClient } from './api'
import type {
    OrderListResponse,
    OrderDetailResponse,
    PaymentSettingsResponse,
    ShipmentFeeResponse,
    CompleteShoppingRequest,
    CompleteShoppingResponse
} from '@/types/order'

export const orderApi = {

    getOrders: async (): Promise<OrderListResponse> => {
        const response = await apiClient.get<OrderListResponse>('/orders')
        return response
    },

    getOrderById: async (orderId: string): Promise<OrderDetailResponse> => {
        const response = await apiClient.get<OrderDetailResponse>(`/orders/${orderId}`)
        return response
    },

    getPaymentSettings: async (): Promise<PaymentSettingsResponse> => {
        const response = await apiClient.get<PaymentSettingsResponse>('/orders/payment-settings')
        return response
    },

    getShipmentFee: async (): Promise<ShipmentFeeResponse> => {
        const response = await apiClient.get<ShipmentFeeResponse>('/orders/calculate-shipment-fee')
        return response
    },

    completeShopping: async (data: CompleteShoppingRequest): Promise<CompleteShoppingResponse> => {
        const response = await apiClient.post<CompleteShoppingResponse>('/orders/complete-shopping', data)
        return response
    }
}
