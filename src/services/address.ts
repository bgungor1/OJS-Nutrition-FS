import { apiClient } from './api'
import type {
    Address,
    CreateAddressRequest,
    UpdateAddressRequest,
    AddressListResponse
} from '@/types/address'

export const addressApi = {
    getAll: async (limit: number = 10, offset: number = 0): Promise<AddressListResponse> => {
        const response = await apiClient.get<AddressListResponse>(
            `/users/addresses?limit=${limit}&offset=${offset}`
        )
        return response
    },

    getById: async (id: string): Promise<Address> => {
        const response = await apiClient.get<Address>(`/users/addresses/${id}`)
        return response
    },

    create: async (data: CreateAddressRequest): Promise<Address> => {
        const response = await apiClient.post<Address>('/users/addresses', data)
        return response
    },

    update: async (id: string, data: UpdateAddressRequest): Promise<Address> => {
        const response = await apiClient.put<Address>(`/users/addresses/${id}`, data)
        return response
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.del(`/users/addresses/${id}`)
    }
}
