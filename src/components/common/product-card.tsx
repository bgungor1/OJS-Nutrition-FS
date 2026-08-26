import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import star from '@/assets/yıldız.png'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProductCardProps {
  id?: number | string
  name: string
  image: string
  description: string
  reviewCount: number
  rating: number
  price: number
  originalPrice?: number
  discountPercentage?: number
}

const ProductCard: FC<ProductCardProps> = ({
  id,
  name,
  image,
  description,
  reviewCount,
  rating,
  price,
  originalPrice,
  discountPercentage
}) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (id) {
      navigate(`/product/${id}`)
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (id) {
      navigate(`/product/${id}`)
    }
  }

  return (
    <div
      className="relative w-full h-full flex flex-col items-center cursor-pointer hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-800 rounded-lg p-4"
      onClick={handleClick}
    >
      {/* İndirim Etiketi */}
      {discountPercentage && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold z-10">
          %{discountPercentage} <span className='block'>İNDİRİM</span>
        </div>
      )}

      {/* Ürün Görseli - Sabit yükseklik */}
      <div className="w-full h-32 flex items-center justify-center mb-3">
        <img src={image} alt={`${name} görseli`} className="max-w-full max-h-full object-contain" />
      </div>

      {/* Ürün Adı - Sabit yükseklik */}
      <div className="h-12 flex items-center justify-center mb-2">
        <p className='text-sm sm:text-base font-medium text-center leading-tight'>{name}</p>
      </div>

      {/* Ürün Açıklaması - Sabit yükseklik */}
      <div className='text-xs text-muted-foreground text-center h-8 flex items-center justify-center mb-2'>
        {description.split('\n').map((line, index) => (
          <p key={index} className="block">{line}</p>
        ))}
      </div>

      {/* Yıldız Değerlendirmesi */}
      <div className="flex justify-center gap-1 mb-2">
        {[...Array(5)].map((_, index) => (
          <img
            key={index}
            src={star}
            alt="yıldız"
            className={`w-3 h-3 ${index < rating ? 'opacity-100' : 'opacity-30'
              }`}
          />
        ))}
      </div>

      {/* Yorum Sayısı ve Fiyat - Alt kısımda sabit konumda */}
      <div className="flex flex-col items-center mt-auto">
        <span className="text-xs text-gray-600 mb-1">{reviewCount.toLocaleString()} Yorum</span>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-green-600">
            {price.toLocaleString()} TL
          </span>

          {originalPrice && (
            <span className="text-xs text-red-400 line-through">
              {originalPrice.toLocaleString()} TL
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-2"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
