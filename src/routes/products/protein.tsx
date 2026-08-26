import { Link } from 'react-router-dom'
import { proteinData } from '@/data/protein-data'
import ProductCard from '@/components/common/product-card'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const Protein = () => {
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
            <BreadcrumbPage>Protein Ürünleri</BreadcrumbPage>
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
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8'>
        {proteinData.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            image={product.image}
            description={product.description}
            reviewCount={product.reviewCount}
            rating={product.rating}
            price={product.price}
            originalPrice={product.originalPrice}
            discountPercentage={product.discountPercentage}
          />
        ))}
      </div>

      <div className='text-center text-gray-600 dark:text-gray-300'>
        <p className=''>Toplam {proteinData.length} ürün görüntüleniyor</p>
      </div>
    </div>
  )
}

export default Protein
