import * as React from 'react';
import type { OrderStatus } from '@/types';

interface UseOrderStatusUpdateOptions {
  orderId: string;
  initialStatus: OrderStatus;
  onUpdate: (orderId: string, status: OrderStatus) => Promise<void>;
  onSuccess?: () => void;
}

export function useOrderStatusUpdate({
  orderId,
  initialStatus,
  onUpdate,
  onSuccess,
}: UseOrderStatusUpdateOptions) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [status, setStatus] = React.useState<OrderStatus>(initialStatus);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const isStockRestore = status === 'cancelled' || status === 'refunded';

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setStatus(initialStatus);
      setError(null);
    }
    setIsOpen(open);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === initialStatus) {
      setIsOpen(false);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onUpdate(orderId, status);
      setIsOpen(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Durum güncellenirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOpen,
    status,
    isSubmitting,
    error,
    isStockRestore,
    setStatus,
    handleOpenChange,
    handleSubmit,
  };
}
