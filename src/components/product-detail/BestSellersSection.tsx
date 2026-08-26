
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import ProductCard from '@/components/common/product-card'
import type { ApiBestSellerProduct } from '@/types/api'
import { getImageUrl } from '@/utils/getImageUrl'

interface BestSellersSectionProps {
    bestSellers: ApiBestSellerProduct[]
    loading: boolean
    error: string | null
    onRetry?: () => void
}

const transformBestSellerToProductCard = (bestSeller: ApiBestSellerProduct) => ({
    id: bestSeller.slug,
    name: bestSeller.name,
    image: getImageUrl(bestSeller.photo_src),
    description: bestSeller.short_explanation,
    reviewCount: bestSeller.comment_count,
    rating: bestSeller.average_star,
    price: bestSeller.price_info.discounted_price || bestSeller.price_info.total_price,
    originalPrice: bestSeller.price_info.discounted_price ? bestSeller.price_info.total_price : undefined,
    discountPercentage: bestSeller.price_info.discount_percentage || undefined
})

export default function BestSellersSection({
    bestSellers,
    loading,
    error,
    onRetry
}: BestSellersSectionProps) {
    const navigate = useNavigate()

    return (
        <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold mb-6">EN ÇOK SATANLAR</h3>

            {loading && (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                    <span className="ml-2 text-gray-600">En çok satanlar yükleniyor...</span>
                </div>
            )}

            {error && !loading && (
                <div className="text-center py-8">
                    <p className="text-red-600 mb-4">{error}</p>
                    {onRetry && (
                        <Button onClick={onRetry} variant="outline" size="sm">
                            Tekrar Dene
                        </Button>
                    )}
                </div>
            )}

            {!loading && !error && bestSellers.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 justify-items-center">
                    {bestSellers.map((bestSeller) => {
                        const productCardData = transformBestSellerToProductCard(bestSeller)
                        return (
                            <div
                                key={bestSeller.slug}
                                className="cursor-pointer flex justify-center"
                                onClick={() => navigate(`/product/${bestSeller.slug}`)}
                            >
                                <ProductCard
                                    id={productCardData.id}
                                    name={productCardData.name}
                                    image={productCardData.image}
                                    description={productCardData.description}
                                    reviewCount={productCardData.reviewCount}
                                    rating={productCardData.rating}
                                    price={productCardData.price}
                                    originalPrice={productCardData.originalPrice}
                                    discountPercentage={productCardData.discountPercentage}
                                />
                            </div>
                        )
                    })}
                </div>
            )}

            {!loading && !error && bestSellers.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-600">En çok satanlar bulunamadı.</p>
                </div>
            )}
        </div>
    )
}