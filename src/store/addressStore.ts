
import { create } from 'zustand'
import type { Address, CreateAddressRequest, UpdateAddressRequest } from '@/types/address'
import { addressApi } from '@/services/address'



interface AddressState {
    addresses: Address[]
    isLoading: boolean
    error: string | null

    // Actions
    fetchAddresses: () => Promise<void>
    addAddress: (data: CreateAddressRequest) => Promise<boolean>
    updateAddress: (id: string, data: UpdateAddressRequest) => Promise<boolean>
    removeAddress: (id: string) => Promise<boolean>
    clearError: () => void
}


export const useAddressStore = create<AddressState>((set) => ({
    addresses: [],
    isLoading: false,
    error: null,

    fetchAddresses: async () => {
        set({ isLoading: true, error: null })

        try {
            const response = await addressApi.getAll() as any
            console.log('📦 Raw API Response:', response)


            let addresses: any[] = []

            if (Array.isArray(response)) {
                addresses = response
            } else if (response.data) {

                if (Array.isArray(response.data)) {
                    addresses = response.data
                } else if (response.data.results) {
                    addresses = response.data.results
                }
            } else if (response.results) {
                addresses = response.results
            }

            console.log('📦 Parsed Adresler:', addresses)
            set({ addresses, isLoading: false })
        } catch (error) {
            console.error('Adresler yüklenemedi:', error)
            set({
                addresses: [],
                error: 'Adresler yüklenirken bir hata oluştu',
                isLoading: false
            })
        }
    },

    /**
     * YENİ ADRES EKLE
     * ===============
     */
    addAddress: async (data: CreateAddressRequest) => {
        set({ isLoading: true, error: null })

        try {
            const response = await addressApi.create(data) as any

            // API { status: 'success', data: {...} } formatında dönüyor
            const newAddress = response.data || response
            console.log('📥 API Response (new address):', newAddress)

            set((state) => ({
                addresses: [...state.addresses, newAddress],
                isLoading: false
            }))

            return true
        } catch (error) {
            console.error('Adres eklenemedi:', error)
            set({
                error: 'Adres eklenirken bir hata oluştu',
                isLoading: false
            })
            return false
        }
    },

    /**
     * ADRES GÜNCELLE
     * ==============
     */
    updateAddress: async (id: string, data: UpdateAddressRequest) => {
        set({ isLoading: true, error: null })

        try {
            const updatedAddress = await addressApi.update(id, data)

            set((state) => ({
                addresses: state.addresses.map((addr) =>
                    addr.id === id ? updatedAddress : addr
                ),
                isLoading: false
            }))

            return true
        } catch (error) {
            console.error('Adres güncellenemedi:', error)
            set({
                error: 'Adres güncellenirken bir hata oluştu',
                isLoading: false
            })
            return false
        }
    },

    /**
     * ADRES SİL
     * =========
     */
    removeAddress: async (id: string) => {
        set({ isLoading: true, error: null })

        try {
            await addressApi.delete(id)

            // Listeden ilgili adresi kaldır
            set((state) => ({
                addresses: state.addresses.filter((addr) => addr.id !== id),
                isLoading: false
            }))

            return true
        } catch (error) {
            console.error('Adres silinemedi:', error)
            set({
                error: 'Adres silinirken bir hata oluştu',
                isLoading: false
            })
            return false
        }
    },

    /**
     * HATA TEMİZLE
     * ============
     */
    clearError: () => set({ error: null })
}))
