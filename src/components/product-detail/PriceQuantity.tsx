
import { Plus, Minus, ShoppingCart, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PriceQuantityProps {
    currentPrice: number
    originalPrice?: number
    servings: number
    quantity: number
    onQuantityChange: (qty: number) => void
    onAddToCart: () => void
    inStock: boolean
    isAdded: boolean
}

export default function PriceQuantity({
    currentPrice,
    originalPrice,
    servings,
    quantity,
    onQuantityChange,
    onAddToCart,
    inStock,
    isAdded
}: PriceQuantityProps) {
    const pricePerServing = Math.round((currentPrice / servings) * 100) / 100

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {currentPrice.toLocaleString()} TL
                </span>
                {originalPrice && (
                    <span className="text-xl text-gray-400 dark:text-gray-500 line-through">
                        {originalPrice.toLocaleString()} TL
                    </span>
                )}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300">
                {pricePerServing} TL/Servis
            </p>

            <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Miktar:
                </span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                        className="h-8 w-8 p-0"
                    >
                        <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onQuantityChange(quantity + 1)}
                        className="h-8 w-8 p-0"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <Button
                onClick={onAddToCart}
                disabled={!inStock || isAdded}
                className={`w-full py-3 text-lg font-medium transition-all duration-300 ${isAdded
                    ? 'bg-green-600 hover:bg-green-600'
                    : 'bg-black hover:bg-gray-800'
                    } text-white`}
            >
                {isAdded ? (
                    <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        SEPETE EKLENDİ
                    </>
                ) : (
                    <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        SEPETE EKLE
                    </>
                )}
            </Button>
        </div>
    )
}