

import { apiClient } from './api'
import type {
    CartResponse,
    AddToCartRequest,
    RemoveFromCartRequest
} from '@/types/cart'

export const cartApi = {

    getCart: async (): Promise<CartResponse> => {
        const response = await apiClient.get<CartResponse>('/users/cart')
        return response
    },

    addToCart: async (data: AddToCartRequest): Promise<CartResponse> => {
        const response = await apiClient.post<CartResponse>('/users/cart', data)
        return response
    },

    removeFromCart: async (data: RemoveFromCartRequest): Promise<CartResponse> => {
        const response = await apiClient.del<CartResponse>('/users/cart', data)
        return response
    }
}
