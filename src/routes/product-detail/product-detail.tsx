
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { productsApi } from '@/services/products'
import { bestSellersApi } from '@/services/best-sellers'
import { transformApiProductToProductDetail } from '@/utils/productTransform'
import type { ProductDetail as ProductDetailType } from '@/types/product'
import type { ApiBestSellerProduct } from '@/types/api'
import { getRelatedProducts } from '@/data/product-detail-data'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/components/ui/button'
import ProductReviews from '@/components/product-reviews'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import {
  ProductGallery,
  ProductInfo,
  FlavorSelector,
  SizeSelector,
  PriceQuantity,
  TrustBadges,
  ProductAccordion,
  RelatedProducts,
  BestSellersSection
} from '@/components/product-detail'

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const syncAddToCart = useCartStore((state) => state.syncAddToCart)
  const setCartOpen = useCartStore((state) => state.setCartOpen)

  const [product, setProduct] = useState<ProductDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedFlavor, setSelectedFlavor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [bestSellers, setBestSellers] = useState<ApiBestSellerProduct[]>([])
  const [bestSellersLoading, setBestSellersLoading] = useState(false)
  const [bestSellersError, setBestSellersError] = useState<string | null>(null)
  const [isAdded, setIsAdded] = useState(false)

  const relatedProducts = getRelatedProducts(6)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        const slug = id || 'whey-protein'
        const response = await productsApi.getProductBySlug(slug)

        if (response.status === 'success') {
          const transformedProduct = transformApiProductToProductDetail(response.data)
          setProduct(transformedProduct)

          if (transformedProduct.flavors.length > 0) {
            setSelectedFlavor(transformedProduct.flavors[0].id)
          }
          if (transformedProduct.sizes.length > 0) {
            setSelectedSize(transformedProduct.sizes[0].id)
          }
        } else {
          setError('Ürün bulunamadı')
        }
      } catch (err) {
        console.error('Ürün yükleme hatası:', err)
        setError('Ürün yüklenirken bir hata oluştu')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setBestSellersLoading(true)
        setBestSellersError(null)
        const response = await bestSellersApi.getBestSellers()

        if (response.status === 'success') {
          setBestSellers(response.data)
        } else {
          setBestSellersError('En çok satanlar yüklenemedi')
        }
      } catch (err) {
        console.error('En çok satanlar yükleme hatası:', err)
        setBestSellersError('En çok satanlar yüklenirken bir hata oluştu')
      } finally {
        setBestSellersLoading(false)
      }
    }
    fetchBestSellers()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-4 text-gray-600">Ürün yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ürün Bulunamadı</h1>
          <p className="text-gray-600 mb-6">{error || 'Aradığınız ürün mevcut değil.'}</p>
          <Button onClick={() => navigate('/')} variant="outline">
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    )
  }

  const selectedSizeData = product.sizes.find(size => size.id === selectedSize)
  const currentPrice = selectedSizeData?.price || product.price
  const currentOriginalPrice = selectedSizeData?.originalPrice || product.originalPrice

  const handleAddToCart = async () => {
    if (!product || !selectedSizeData) return

    await syncAddToCart({
      id: String(product.id),
      name: product.name,
      image: product.image,
      price: currentPrice,
      quantity: quantity,
      flavor: selectedFlavor || undefined,
      size: selectedSize || undefined,
      product_id: product.id,
      product_variant_id: selectedSizeData.id,
    })
    setCartOpen(true)

    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Ana Sayfa</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/products">Ürünler</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          <div className="order-1">
            <ProductGallery image={product.image} name={product.name} />
          </div>

          <ProductAccordion
            features={product.features}
            nutritionalInfo={product.nutritionalInfo}
            usageInstructions={product.usageInstructions}
            className="order-2 xl:hidden"
          />

          <div className="space-y-6 order-3 xl:order-2">
            <ProductInfo
              name={product.name}
              description={product.description}
              reviewCount={product.reviewCount}
              rating={product.rating}
              isVegetarian={product.isVegetarian}
              isGlutenFree={product.isGlutenFree}
            />

            <FlavorSelector
              flavors={product.flavors}
              selectedFlavor={selectedFlavor}
              onFlavorChange={setSelectedFlavor}
            />

            <SizeSelector
              sizes={product.sizes}
              selectedSize={selectedSize}
              onSizeChange={setSelectedSize}
            />

            <PriceQuantity
              currentPrice={currentPrice}
              originalPrice={currentOriginalPrice}
              servings={selectedSizeData?.servings || 1}
              quantity={quantity}
              onQuantityChange={setQuantity}
              onAddToCart={handleAddToCart}
              inStock={product.inStock}
              isAdded={isAdded}
            />

            <TrustBadges />

            <div className="border-t border-gray-200 dark:border-gray-700 my-6" />

            <div className="text-sm text-gray-600 dark:text-gray-300">
              Son Kullanım Tarihi: {product.expirationDate}
            </div>

            <ProductAccordion
              features={product.features}
              nutritionalInfo={product.nutritionalInfo}
              usageInstructions={product.usageInstructions}
              className="hidden xl:block"
            />
          </div>
        </div>

        <RelatedProducts products={relatedProducts} />

        <div className="mt-16">
          <ProductReviews productName={product.name} maxReviews={15} />
        </div>

        <BestSellersSection
          bestSellers={bestSellers}
          loading={bestSellersLoading}
          error={bestSellersError}
          onRetry={() => window.location.reload()}
        />
      </div>
    </div>
  )
}
export default ProductDetail