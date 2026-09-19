import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { useOrderStatusUpdate } from './use-order-status-update';
import type { OrderStatus } from '@/types';

interface OrderStatusDialogProps {
  orderId: string;
  orderNo: string;
  currentStatus: OrderStatus;
  trigger?: React.ReactNode;
  onUpdate: (orderId: string, status: OrderStatus) => Promise<void>;
  onSuccess?: () => void;
}

const STATUS_OPTIONS: Array<{ value: OrderStatus; label: string }> = [
  { value: 'pending', label: 'Beklemede' },
  { value: 'processing', label: 'Hazırlanıyor' },
  { value: 'shipped', label: 'Kargoya Verildi' },
  { value: 'delivered', label: 'Teslim Edildi' },
  { value: 'cancelled', label: 'İptal Edildi' },
  { value: 'refunded', label: 'İade Edildi' },
];

export function OrderStatusDialog({
  orderId,
  orderNo,
  currentStatus,
  trigger,
  onUpdate,
  onSuccess,
}: OrderStatusDialogProps) {
  const {
    isOpen,
    status,
    isSubmitting,
    error,
    isStockRestore,
    setStatus,
    handleOpenChange,
    handleSubmit,
  } = useOrderStatusUpdate({
    orderId,
    initialStatus: currentStatus,
    onUpdate,
    onSuccess,
  });

  return (
    <>
      {trigger ? (
        <span onClick={() => handleOpenChange(true)} className="inline-block cursor-pointer">
          {trigger}
        </span>
      ) : (
        <Button variant="outline" size="sm" onClick={() => handleOpenChange(true)}>
          Durumu Güncelle
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Sipariş Durumunu Güncelle</DialogTitle>
              <DialogDescription>
                <span className="font-semibold text-foreground">{orderNo}</span> numaralı siparişin operasyonel statüsünü değiştirin.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="order-status-select">Yeni Durum</Label>
                <select
                  id="order-status-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {isStockRestore && (
                <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Stok İadesi Uyarısı:</span> Sipariş iptal veya iade edildiğinde ürün kalemleri otomatik olarak stoka iade edilecek ve denetim günlüğü oluşturulacaktır.
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Vazgeç
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
