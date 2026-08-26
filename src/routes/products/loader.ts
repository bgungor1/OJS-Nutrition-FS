import { productsApi } from '@/services/products'
import { getMockProductsResponse } from '@/data/mock-api-data'

export const productsLoader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1', 10)
  const limit = parseInt(url.searchParams.get('limit') || '12', 10)

  try {
    const productsData = await productsApi.getProducts({ page, limit })
    
    return {
      products: productsData.data.results,
      pagination: {
        count: productsData.data.count,
        next: productsData.data.next,
        previous: productsData.data.previous,
        currentPage: page,
        totalPages: Math.ceil(productsData.data.count / limit),
        limit
      }
    }
  } catch (error) {
    console.warn('Products loader fallback devrede:', error)
    const fallbackData = getMockProductsResponse({ page, limit })
    return {
      products: fallbackData.data.results,
      pagination: {
        count: fallbackData.data.count,
        next: fallbackData.data.next,
        previous: fallbackData.data.previous,
        currentPage: page,
        totalPages: Math.ceil(fallbackData.data.count / limit),
        limit
      }
    }
  }
}