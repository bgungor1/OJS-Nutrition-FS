import { apiClient } from './api'
import type { ApiProductsResponse, ApiProductDetailResponse } from '@/types/api'
import { getMockProductsResponse, getMockProductDetailResponse } from '@/data/mock-api-data'

export interface ProductsParams {
  page?: number
  limit?: number
}

export const productsApi = {
  getProducts: async (params: ProductsParams = {}): Promise<ApiProductsResponse> => {
    try {
      const { page = 1, limit = 12 } = params
      const offset = (page - 1) * limit
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      })
      
      const response = await apiClient.get<ApiProductsResponse>(`/products?${queryParams}`)
      if (response && response.data && response.data.results) {
        return response
      }
      return getMockProductsResponse(params)
    } catch (error) {
      console.warn('⚠️ Canlı API sunucusuna ulaşılamadı. Portföy/Demo için Mock Ürün Verisi kullanılıyor:', error)
      return getMockProductsResponse(params)
    }
  },

  getProductBySlug: async (slug: string): Promise<ApiProductDetailResponse> => {
    try {
      const response = await apiClient.get<ApiProductDetailResponse>(`/products/${slug}`)
      if (response && response.status === 'success' && response.data) {
        return response
      }
      return getMockProductDetailResponse(slug)
    } catch (error) {
      console.warn(`⚠️ Canlı API üzerinden "${slug}" ürününe ulaşılamadı. Mock Ürün Detayı kullanılıyor:`, error)
      return getMockProductDetailResponse(slug)
    }
  }
}

