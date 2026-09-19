'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { ApiProduct } from '@/types';

interface ProductDeleteDialogProps {
  product: ApiProduct | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function ProductDeleteDialog({
  product,
  isDeleting,
  onClose,
  onConfirm,
}: ProductDeleteDialogProps) {
  return (
    <Dialog open={Boolean(product)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ürünü Silmek İstediğinize Emin Misiniz?</DialogTitle>
          <DialogDescription>
            &quot;{product?.name}&quot; ürünü ve bağlı varyantları arşivlenecektir. Bu işlem geri alınamaz.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Vazgeç
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Siliniyor...' : 'Evet, Ürünü Sil'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
