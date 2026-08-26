import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './common/navbar'
import Footer from './common/footer'
import Chatbot from './chatbot'
import PortfolioNotice from './common/portfolio-notice'
import { productsApi } from '../services/products'
import { mockProductsList } from '../data/mock-api-data'
import { type ApiProduct } from '../types/api'

export default function Layout() {
  const [products, setProducts] = useState<ApiProduct[]>(mockProductsList)

  useEffect(() => {
    let isMounted = true
    const loadProducts = async () => {
      try {
        const response = await productsApi.getProducts({ page: 1, limit: 100 })
        if (isMounted && response?.data?.results && response.data.results.length > 0) {
          setProducts(response.data.results)
        }
      } catch {

      }
    }
    loadProducts()
    return () => {
      isMounted = false
    }
  }, [])


  return (
    <div className="min-h-screen flex flex-col">
      <PortfolioNotice />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Chatbot products={products} />
    </div>
  )
}
