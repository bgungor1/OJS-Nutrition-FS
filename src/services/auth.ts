
import { apiClient } from './api'
import type {
    LoginRequest,
    RegisterRequest,
    LoginSuccessResponse,
    RegisterSuccessResponse,
    AuthErrorResponse
} from '@/types/auth'

const AUTH_API_KEY = import.meta.env.VITE_AUTH_API_KEY || ''


export const authApi = {
    /**
     * @param email - Kullanıcının e-posta adresi
     * @param password - Kullanıcının şifresi
     * @returns JWT tokenları (access + refresh) veya hata
     * 
     */
    login: async (email: string, password: string): Promise<LoginSuccessResponse | AuthErrorResponse> => {

        const requestData: LoginRequest = {
            username: email,
            password: password,
            api_key: AUTH_API_KEY
        }

        try {
            const response = await apiClient.post<LoginSuccessResponse>('/auth/login', requestData)
            return response
        } catch (error) {
            console.error('Login API hatası:', error)

            if (error instanceof Error) {
                return {
                    status: 'error',
                    reason: {
                        general: [error.message || 'Giriş yapılırken bir hata oluştu']
                    }
                }
            }

            return {
                status: 'error',
                reason: {
                    general: ['Beklenmeyen bir hata oluştu']
                }
            }
        }
    },

    register: async (data: {
        email: string
        password: string
        confirmPassword: string
        firstName: string
        lastName: string
    }): Promise<RegisterSuccessResponse | AuthErrorResponse> => {
        const requestData: RegisterRequest = {
            email: data.email,
            password: data.password,
            password2: data.confirmPassword,
            api_key: AUTH_API_KEY,
            first_name: data.firstName,
            last_name: data.lastName
        }

        try {
            const response = await apiClient.post<RegisterSuccessResponse>('/auth/register', requestData)
            return response
        } catch (error) {
            console.error('Register API hatası:', error)

            if (error instanceof Error) {
                return {
                    status: 'error',
                    reason: {
                        general: [error.message || 'Kayıt yapılırken bir hata oluştu']
                    }
                }
            }

            return {
                status: 'error',
                reason: {
                    general: ['Beklenmeyen bir hata oluştu']
                }
            }
        }
    },


    refreshToken: async (refreshToken: string): Promise<{ access: string } | AuthErrorResponse> => {
        try {
            const response = await apiClient.post<{ access: string }>('/auth/token/refresh', {
                refresh: refreshToken
            })
            return response
        } catch (error) {
            console.error('Token refresh hatası:', error)
            return {
                status: 'error',
                reason: {
                    general: ['Token yenilenemedi, lütfen tekrar giriş yapın']
                }
            }
        }
    },


    getProfile: async (): Promise<{ user: { id: string; email: string; first_name: string; last_name: string } } | AuthErrorResponse> => {
        try {
            const response = await apiClient.get<{ user: { id: string; email: string; first_name: string; last_name: string } }>('/auth/profile')
            return response
        } catch (error) {
            console.error('Profile API hatası:', error)
            return {
                status: 'error',
                reason: {
                    general: ['Profil bilgileri alınamadı']
                }
            }
        }
    }
}
