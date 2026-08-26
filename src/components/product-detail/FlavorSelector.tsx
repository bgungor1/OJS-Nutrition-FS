
interface Flavor {
    id: string
    name: string
    isAvailable: boolean
}

interface FlavorSelectorProps {
    flavors: Flavor[]
    selectedFlavor: string
    onFlavorChange: (flavorId: string) => void
}

const getFlavorImage = (flavorId: string): string => {
    const imageMap: Record<string, string> = {
        'biscuit': '/src/assets/flavors/biscuit.webp',
        'chocolate': '/src/assets/flavors/choc.webp',
        'banana': '/src/assets/flavors/banana.webp',
        'caramel': '/src/assets/flavors/salted caramel.webp',
        'choco-nut': '/src/assets/flavors/choco-nut.webp',
        'coconut': '/src/assets/flavors/cookie-cream.webp',
        'raspberry': '/src/assets/flavors/strawberry.webp',
        'strawberry': '/src/assets/flavors/strawberry.webp'
    }
    return imageMap[flavorId] || '/src/assets/flavors/strawberry.webp'
}

const getFlavorEmoji = (flavorId: string): string => {
    const emojiMap: Record<string, string> = {
        'biscuit': '🍪',
        'chocolate': '🍫',
        'banana': '🍌',
        'caramel': '🍯',
        'choco-nut': '🌰',
        'coconut': '🥥',
        'raspberry': '🫐',
        'strawberry': '🍓'
    }
    return emojiMap[flavorId] || '🍯'
}

export default function FlavorSelector({
    flavors,
    selectedFlavor,
    onFlavorChange
}: FlavorSelectorProps) {
    if (flavors.length === 0) return null

    return (
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
                AROMA:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {flavors.map((flavor) => (
                    <button
                        key={flavor.id}
                        onClick={() => onFlavorChange(flavor.id)}
                        disabled={!flavor.isAvailable}
                        className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${selectedFlavor === flavor.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                            } ${!flavor.isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                            <img
                                src={getFlavorImage(flavor.id)}
                                alt={flavor.name}
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                    const emojiSpan = e.currentTarget.nextElementSibling as HTMLElement
                                    if (emojiSpan) {
                                        emojiSpan.style.display = 'block'
                                        emojiSpan.textContent = getFlavorEmoji(flavor.id)
                                    }
                                }}
                            />
                            <span className="text-2xl hidden" />
                        </div>
                        <div className="text-xs leading-tight text-center">
                            {flavor.name}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}