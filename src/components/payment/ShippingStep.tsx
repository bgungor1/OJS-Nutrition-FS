import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ShippingStepProps {
    shippingCost: number
    onBack: () => void
    onNext: () => void
}

export default function ShippingStep({
    shippingCost,
    onBack,
    onNext
}: ShippingStepProps) {
    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Kargo Bilgisi
            </h2>

            <Card className="p-4 border-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                            Standart Kargo
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            2-3 iş günü içinde teslim
                        </p>
                    </div>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        ₺{shippingCost.toFixed(2)}
                    </span>
                </div>
            </Card>

            <div className="flex gap-4 mt-6">
                <Button
                    variant="outline"
                    className="flex-1"
                    onClick={onBack}
                >
                    Geri
                </Button>
                <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={onNext}
                >
                    Ödeme ile Devam Et
                </Button>
            </div>
        </div>
    )
}