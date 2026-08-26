
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import OrderStatusBadge from './OrderStatusBadge'
import type { Order } from '@/types/order'
import { getImageUrl } from '@/utils/getImageUrl'

interface OrderDetailModalProps {
    order: Order | null
    onClose: () => void
}

export default function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
    const isOpen = order !== null
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Sipariş Detayı</DialogTitle>
                    <DialogDescription>
                        Siparişinizin özet bilgilerini aşağıda bulabilirsiniz.
                    </DialogDescription>
                </DialogHeader>
                {order && (
                    <div className="space-y-6 text-sm">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Sipariş #{order.order_no}
                                </h3>
                                <p className="text-muted-foreground">
                                    {new Date(order.created_at).toLocaleDateString('tr-TR')}
                                </p>
                            </div>
                            <OrderStatusBadge status={order.order_status} />
                        </div>
                        {order.cart_detail && order.cart_detail.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                                    Ürünler
                                </h4>
                                <div className="space-y-3">
                                    {order.cart_detail.map((item: any) => (
                                        <div
                                            key={item.variant_id || item.id}
                                            className="flex items-center gap-4 rounded-md border border-gray-200 dark:border-gray-700 p-3"
                                        >
                                            {item.photo_src && (
                                                <img
                                                    src={getImageUrl(item.photo_src)}
                                                    alt={item.name}
                                                    className="w-16 h-16 object-cover rounded-md"
                                                />
                                            )}

                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {item.name}
                                                </p>
                                                {item.variant_name && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Seçenek: {item.variant_name}
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground">
                                                    Adet: {item.pieces} • Birim Fiyat: ₺{Number(item.unit_price || 0).toFixed(2)}
                                                </p>
                                            </div>

                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                ₺{Number(item.total_price || 0).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-muted/40 dark:bg-muted/10 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between">
                                <span>Kargo:</span>
                                <span>₺{order.shipping_fee?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-base">
                                <span>Toplam:</span>
                                <span>₺{order.total_price?.toFixed(2) || '0.00'}</span>
                            </div>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="secondary" onClick={onClose}>
                        Kapat
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}