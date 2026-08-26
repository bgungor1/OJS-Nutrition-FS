
import { useNavigate } from 'react-router-dom'
import ProductCard from '@/components/common/product-card'

interface RelatedProduct {
    id: string | number
    name: string
    image: string
    description: string
    reviewCount: number
    rating: number
    price: number
    originalPrice?: number
    discountPercentage?: number
}

interface RelatedProductsProps {
    products: RelatedProduct[]
    title?: string
}

export default function RelatedProducts({
    products,
    title = 'SON GÖRÜNTÜLENEN ÜRÜNLER'
}: RelatedProductsProps) {
    const navigate = useNavigate()

    if (products.length === 0) return null

    return (
        <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold mb-6">{title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 justify-items-center">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="cursor-pointer flex justify-center"
                        onClick={() => navigate(`/product/${product.id}`)}
                    >
                        <ProductCard
                            name={product.name}
                            image={product.image}
                            description={product.description}
                            reviewCount={product.reviewCount}
                            rating={product.rating}
                            price={product.price}
                            originalPrice={product.originalPrice}
                            discountPercentage={product.discountPercentage}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}