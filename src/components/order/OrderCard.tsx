
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import OrderStatusBadge from './OrderStatusBadge'
import type { Order } from '@/types/order'

interface OrderCardProps {
    order: Order
    onViewDetails: (order: Order) => void
}

export default function OrderCard({ order, onViewDetails }: OrderCardProps) {
    return (
        <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow duration-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
            <div className="flex flex-col lg:flex-row gap-4">

                <div className="flex-1 space-y-3">

                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2">
                        <div className="flex-1">
                            <h4 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">
                                Sipariş #{order.order_no}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {order.cart_detail?.length || 0} ürün
                            </p>
                        </div>

                        <div className="mt-2 lg:mt-0">
                            <OrderStatusBadge status={order.order_status} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Tarih:</span>{' '}
                                {new Date(order.created_at).toLocaleDateString('tr-TR')}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                            ₺{order.total_price?.toFixed(2) || '0.00'}
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full lg:w-auto"
                            onClick={() => onViewDetails(order)}
                        >
                            Detayı Görüntüle
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    )
}