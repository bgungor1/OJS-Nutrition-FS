
interface Size {
    id: string
    name: string
    servings: number
    price: number
    originalPrice?: number
    discountPercentage?: number
    isAvailable: boolean
}

interface SizeSelectorProps {
    sizes: Size[]
    selectedSize: string
    onSizeChange: (sizeId: string) => void
}

export default function SizeSelector({
    sizes,
    selectedSize,
    onSizeChange
}: SizeSelectorProps) {
    return (
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
                BOYUT:
            </label>
            <div className="flex flex-wrap gap-2 sm:gap-3">
                {sizes.map((size) => (
                    <button
                        key={size.id}
                        onClick={() => onSizeChange(size.id)}
                        disabled={!size.isAvailable}
                        className={`relative p-3 sm:p-4 border-2 rounded-lg text-sm font-medium transition-colors ${selectedSize === size.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                            } ${!size.isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        {size.discountPercentage && (
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                %{size.discountPercentage} İNDİRİM
                            </div>
                        )}
                        <div className="font-bold">{size.name}</div>
                        <div className="text-xs text-gray-500">({size.servings} servis)</div>
                    </button>
                ))}
            </div>
        </div>
    )
}