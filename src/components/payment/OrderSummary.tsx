import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface CartItem {
    id: string
    name: string
    image: string
    price: number
    quantity: number
}

interface OrderSummaryProps {
    items: CartItem[]
    subtotal: number
    shippingCost: number
    tax: number
    total: number
}

export default function OrderSummary({
    items,
    subtotal,
    shippingCost,
    tax,
    total
}: OrderSummaryProps) {
    return (
        <div className="bg-gray-100 dark:bg-gray-700 p-4 sm:p-6 lg:p-8">
            <div className="max-w-md mx-auto">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Sipariş Özeti
                </h2>

                <div className="space-y-4 mb-6">
                    {items.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400">
                            Sepetiniz boş.
                        </p>
                    ) : (
                        items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-4 p-4 bg-white dark:bg-gray-600 rounded-lg"
                            >
                                <div className="relative">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-16 h-16 object-cover rounded-lg"
                                    />
                                    <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs">
                                        {item.quantity}
                                    </Badge>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                                        {item.name}
                                    </h3>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                                        ₺{(item.price * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <Separator className="my-6" />

                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Ara Toplam</span>
                        <span className="text-gray-900 dark:text-white">₺{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Kargo</span>
                        <span className="text-gray-900 dark:text-white">₺{shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">KDV (%18)</span>
                        <span className="text-gray-900 dark:text-white">₺{tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                        <span className="text-gray-900 dark:text-white">Toplam</span>
                        <span className="text-gray-900 dark:text-white">₺{total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}