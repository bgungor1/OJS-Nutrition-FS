import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ProductInfoProps {
    name: string
    description: string
    reviewCount: number
    rating: number
    isVegetarian?: boolean
    isGlutenFree?: boolean
}

export default function ProductInfo({
    name,
    description,
    reviewCount,
    rating,
    isVegetarian = false,
    isGlutenFree = false
}: ProductInfoProps) {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {name}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                {description}
            </p>

            <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                    {[...Array(5)].map((_, index) => (
                        <Star
                            key={index}
                            className={`w-5 h-5 ${index < Math.floor(rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                                }`}
                        />
                    ))}
                </div>
                <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                    {reviewCount.toLocaleString()} Yorum
                </span>
            </div>
            <div className="flex space-x-2">
                {isVegetarian && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                        VEJETARYEN
                    </Badge>
                )}
                {isGlutenFree && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                        GLUTENSİZ
                    </Badge>
                )}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 my-6" />
        </div>
    )
}