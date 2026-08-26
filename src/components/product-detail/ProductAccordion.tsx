
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface NutritionalInfo {
    calories: number
    protein: number
    carbohydrates: number
    fat: number
}

interface ProductAccordionProps {
    features: string[]
    nutritionalInfo: NutritionalInfo
    usageInstructions: string
    className?: string
}

type SectionKey = 'features' | 'nutrition' | 'usage'

export default function ProductAccordion({
    features,
    nutritionalInfo,
    usageInstructions,
    className = ''
}: ProductAccordionProps) {
    const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
        features: false,
        nutrition: false,
        usage: false
    })

    const toggleSection = (section: SectionKey) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }))
    }

    return (
        <div className={`space-y-2 ${className}`}>
            <button
                onClick={() => toggleSection('features')}
                className="w-full flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
                <span className="font-medium text-gray-900 dark:text-white">ÖZELLİKLER</span>
                <ChevronDown
                    className={`w-4 h-4 transition-transform ${expandedSections.features ? 'rotate-180' : ''
                        }`}
                />
            </button>
            {expandedSections.features && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <ul className="space-y-2">
                        {features.map((feature, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-300">
                                • {feature}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <button
                onClick={() => toggleSection('nutrition')}
                className="w-full flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
                <span className="font-medium text-gray-900 dark:text-white">BESİN İÇERİĞİ</span>
                <ChevronDown
                    className={`w-4 h-4 transition-transform ${expandedSections.nutrition ? 'rotate-180' : ''
                        }`}
                />
            </button>
            {expandedSections.nutrition && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <div>Kalori: {nutritionalInfo.calories}</div>
                        <div>Protein: {nutritionalInfo.protein}g</div>
                        <div>Karbonhidrat: {nutritionalInfo.carbohydrates}g</div>
                        <div>Yağ: {nutritionalInfo.fat}g</div>
                    </div>
                </div>
            )}

            <button
                onClick={() => toggleSection('usage')}
                className="w-full flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
                <span className="font-medium text-gray-900 dark:text-white">KULLANIM ŞEKLİ</span>
                <ChevronDown
                    className={`w-4 h-4 transition-transform ${expandedSections.usage ? 'rotate-180' : ''
                        }`}
                />
            </button>
            {expandedSections.usage && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">{usageInstructions}</p>
                </div>
            )}
        </div>
    )
}