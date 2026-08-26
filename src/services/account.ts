
import { apiClient } from './api'
import type {
    UpdateProfileRequest,
    AccountApiResponse
} from '@/types/account'

export const accountApi = {

    getProfile: async (): Promise<AccountApiResponse> => {


        const response = await apiClient.get<AccountApiResponse>('/users/my-account')
        return response
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<AccountApiResponse> => {
        const response = await apiClient.put<AccountApiResponse>('/users/my-account', data)
        return response
    }
}
