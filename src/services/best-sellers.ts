import { apiClient } from './api'
import type { ApiBestSellerResponse } from '@/types/api'
import { getMockBestSellersResponse } from '@/data/mock-api-data'

export const bestSellersApi = {
  getBestSellers: async (): Promise<ApiBestSellerResponse> => {
    try {
      const response = await apiClient.get<ApiBestSellerResponse>('/products/best-sellers')
      if (response && response.status === 'success' && response.data && response.data.length > 0) {
        return response
      }
      return getMockBestSellersResponse()
    } catch (error) {
      console.warn('⚠️ Canlı API çok satanlar servisine ulaşılamadı. Portföy/Demo için Mock Çok Satanlar kullanılıyor:', error)
      return getMockBestSellersResponse()
    }
  }
}

