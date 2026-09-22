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
import { AlertCircle } from 'lucide-react';
import type { ApiProduct } from '@/types';

interface ProductDeleteDialogProps {
  product: ApiProduct | null;
  isDeleting: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function ProductDeleteDialog({
  product,
  isDeleting,
  error,
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

        {error && (
          <div
            role="alert"
            className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-center gap-2"
          >
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

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
