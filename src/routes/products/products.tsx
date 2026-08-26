import { useLoaderData, useSearchParams, Link } from 'react-router-dom'
import ProductCard from '@/components/common/product-card'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import type { ApiProduct } from '@/types/api'
import { getImageUrl } from '@/utils/getImageUrl'

interface ProductsLoaderData {
  products: ApiProduct[]
  pagination: {
    count: number
    next: string | null
    previous: string | null
    currentPage: number
    totalPages: number
    limit: number
  }
}

const Products = () => {
  const { products, pagination } = useLoaderData() as ProductsLoaderData
  const [searchParams] = useSearchParams()

  const createPageUrl = (page: number) => {
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set('page', page.toString())
    return `?${newSearchParams.toString()}`
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Ana Sayfa</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Ürünler</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className='text-center mb-8'>
        <h1 className='text-4xl font-bold mb-4'>
          PROTEİN
        </h1>
        <p className='text-gray-600 dark:text-gray-300 max-w-3xl mx-auto'>
          Vücudun tüm fonksiyonlarını sağlıklı bir şekilde yerine getirmesini sağlayan temel yapı taşlarından biri proteindir.
          Protein kısaca, bir veya daha fazla amino asit artığından oluşan organik bileşiklerdir.
        </p>
      </div>

      <div className='grid grid-cols-4 gap-1 mb-8'>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            image={getImageUrl(product.photo_src)}
            description={product.short_explanation}
            reviewCount={product.comment_count}
            rating={product.average_star}
            price={product.price_info.discounted_price || product.price_info.total_price}
            originalPrice={product.price_info.discounted_price ? product.price_info.total_price : undefined}
            discountPercentage={product.price_info.discount_percentage || undefined}
          />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <Pagination className="mb-8">
          <PaginationContent>
            {pagination.currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious href={createPageUrl(pagination.currentPage - 1)}>
                  Önceki
                </PaginationPrevious>
              </PaginationItem>
            )}

            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum: number

              if (pagination.totalPages <= 5) {
                pageNum = i + 1
              } else if (pagination.currentPage <= 3) {
                pageNum = i + 1
              } else if (pagination.currentPage >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i
              } else {
                pageNum = pagination.currentPage - 2 + i
              }

              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href={createPageUrl(pageNum)}
                    isActive={pageNum === pagination.currentPage}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            {pagination.currentPage < pagination.totalPages && (
              <PaginationItem>
                <PaginationNext href={createPageUrl(pagination.currentPage + 1)}>
                  Sonraki
                </PaginationNext>
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}

      <div className='text-center text-gray-600 dark:text-gray-300'>
        <p>
          Sayfa {pagination.currentPage} / {pagination.totalPages}
          ({pagination.count} ürün toplam)
        </p>
      </div>
    </div>
  )
}

export default Products
