import { StrictMode } from 'react'
// import ReactDOM from "react-dom/client"
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import Layout from './components/layout'
import { ThemeProvider } from './components/theme-provider'

// Barrel Export - Tüm route'lar tek seferde import ediliyor
import {
  Home,
  About,
  Contact,
  FAQ,
  Products,
  Protein,
  LoginPage,
  Account,
  Addresses,
  Order,
  Payment,
  ThankYou
} from './routes'
import ProductDetail from './routes/product-detail/product-detail'
import ViewTransitionWrapper from './components/view-transition-wrapper'

import { bestSellersApi } from './services/best-sellers'
import { mockBestSellersData } from './data/mock-api-data'
import { productsLoader } from './routes/products/loader'
import { ProtectedRoute, GuestRoute } from './routes/protected-route'

const homeLoader = async () => {
  try {
    const response = await bestSellersApi.getBestSellers()
    const bestSellers = response?.data && response.data.length > 0 ? response.data : mockBestSellersData
    return {
      bestSellers
    }
  } catch (error) {
    console.warn('Home loader fallback devrede:', error)
    return {
      bestSellers: mockBestSellersData
    }
  }
}



const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
        loader: homeLoader
      },
      {
        path: "product/:id",
        element: (
          <ViewTransitionWrapper>
            <ProductDetail />
          </ViewTransitionWrapper>
        )
      },
      {
        path: "products",
        element: (
          <ViewTransitionWrapper>
            <Products />
          </ViewTransitionWrapper>
        ),
        loader: productsLoader
      },
      {
        path: "products/protein",
        element: (
          <ViewTransitionWrapper>
            <Protein />
          </ViewTransitionWrapper>
        )
      },

      {
        path: "contact",
        element: <Contact />
      },
      {
        path: "faq",
        element: <FAQ />
      },
      {
        path: "login",
        element: <GuestRoute><LoginPage /></GuestRoute>
      },
      {
        path: "about",
        element: <About />
      },
      {
        path: "account",
        element: <ProtectedRoute><Account /></ProtectedRoute>,
        children: [
          {
            path: "addresses",
            element: <Addresses />
          },
          {
            path: "order",
            element: <Order />
          }
        ]
      }
    ]
  },
  {
    path: "payment",
    element: <ProtectedRoute><Payment /></ProtectedRoute>
  },
  {
    path: "payment/thank-you",
    element: <ThankYou />
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="ojs-nutrition-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
)
