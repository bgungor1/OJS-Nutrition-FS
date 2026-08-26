import { create } from 'zustand'
import { persist, type PersistStorage, type StorageValue } from 'zustand/middleware'
import type { User } from '@/types/auth'
import type { UpdateProfileRequest } from '@/types/account'
import { accountApi } from '@/services/account'


interface AuthState {
    user: User | null
    accessToken: string | null
    refreshToken: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null


    setAuth: (user: User, accessToken: string, refreshToken: string) => void
    logout: () => void
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    clearError: () => void
    updateTokens: (accessToken: string, refreshToken?: string) => void

    fetchProfile: () => Promise<void>              // API'den profil bilgilerini çek
    updateProfile: (data: UpdateProfileRequest) => Promise<boolean>  // Profili güncelle
}


const authStorage: PersistStorage<AuthState> = {
    getItem: (name) => {
        try {
            const str = localStorage.getItem(name)
            if (!str) return null
            return JSON.parse(str) as StorageValue<AuthState>
        } catch (error) {
            console.error('Auth storage okuma hatası:', error)
            return null
        }
    },
    setItem: (name, value) => {
        try {
            localStorage.setItem(name, JSON.stringify(value))
        } catch (error) {
            console.error('Auth storage yazma hatası:', error)
        }
    },
    removeItem: (name) => {
        try {
            localStorage.removeItem(name)
        } catch (error) {
            console.error('Auth storage silme hatası:', error)
        }
    },
}


export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            setAuth: (user, accessToken, refreshToken) => set({
                user,
                accessToken,
                refreshToken,
                isAuthenticated: true,
                error: null
            }),

            logout: () => set({
                user: null,
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false,
                error: null
            }),

            setLoading: (isLoading) => set({ isLoading }),
            setError: (error) => set({ error }),
            clearError: () => set({ error: null }),

            updateTokens: (accessToken, refreshToken) => set((state) => ({
                accessToken,
                refreshToken: refreshToken ?? state.refreshToken
            })),

            fetchProfile: async () => {
                set({ isLoading: true, error: null })

                try {
                    const response = await accountApi.getProfile() as any

                    console.log('👤 Profile API Response:', response)


                    const profileData = response.data || response

                    // User objesini oluştur
                    const user: User = {
                        id: profileData.id,
                        email: profileData.email,
                        first_name: profileData.first_name,
                        last_name: profileData.last_name,
                        phone_number: profileData.phone_number
                    }

                    set({ user, isLoading: false })
                } catch (error) {
                    console.error('Profil yüklenemedi:', error)
                    set({
                        error: 'Profil bilgileri yüklenirken hata oluştu',
                        isLoading: false
                    })
                }
            },


            updateProfile: async (data: UpdateProfileRequest) => {
                set({ isLoading: true, error: null })

                try {
                    const response = await accountApi.updateProfile(data) as any

                    console.log('👤 Update Profile Response:', response)

                    const profileData = response.data || response
                    set((state) => ({
                        user: state.user ? {
                            ...state.user,
                            first_name: profileData.first_name,
                            last_name: profileData.last_name,
                            phone_number: profileData.phone_number
                        } : null,
                        isLoading: false
                    }))

                    return true
                } catch (error) {
                    console.error('Profil güncellenemedi:', error)
                    set({
                        error: 'Profil güncellenirken hata oluştu',
                        isLoading: false
                    })
                    return false
                }
            }
        }),
        {
            name: 'auth-storage',
            storage: authStorage,

            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
                isLoading: false,
                error: null,
            } as AuthState)
        }
    )
)

export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useCurrentUser = () => useAuthStore((state) => state.user)
export const useAuthLoading = () => useAuthStore((state) => state.isLoading)
export const useAuthError = () => useAuthStore((state) => state.error)