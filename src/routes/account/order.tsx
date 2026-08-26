
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Package, Loader2 } from 'lucide-react'
import { useOrderStore } from '@/store/orderStore'
import type { Order as OrderType } from '@/types/order'
import { OrderCard, OrderDetailModal } from '@/components/order'

function Order() {
  const { orders, isLoading, error, fetchOrders } = useOrderStore()
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleOpenDetails = (order: OrderType) => {
    setSelectedOrder(order)
  }

  const handleCloseDetails = () => {
    setSelectedOrder(null)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => fetchOrders()}>Tekrar Dene</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Package className="w-6 h-6" />
        <h3 className="text-xl sm:text-2xl font-bold">Siparişlerim</h3>
      </div>

      <div className="space-y-4">
        {orders.map((order, index) => (
          <div key={order.order_no}>
            <OrderCard
              order={order}
              onViewDetails={handleOpenDetails}
            />
            {index < orders.length - 1 && (
              <Separator className="my-4" />
            )}
          </div>
        ))}
      </div>
      {orders.length === 0 && (
        <Card className="p-12 text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
          <Package className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Henüz siparişiniz yok
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            İlk siparişinizi vermek için ürünlerimizi inceleyin
          </p>
          <Button>
            Alışverişe Başla
          </Button>
        </Card>
      )}
      <OrderDetailModal
        order={selectedOrder}
        onClose={handleCloseDetails}
      />
    </div>
  )
}
export default Order