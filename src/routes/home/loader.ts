import { bestSellersApi } from '@/services/best-sellers'

export const homeLoader = async () => {
  try {
    const bestSellersData = await bestSellersApi.getBestSellers()
    return {
      bestSellers: bestSellersData
    }
  } catch (error) {
    console.error('Home loader hatası:', error)
    throw new Error('Veriler yüklenemedi')
  }
}
