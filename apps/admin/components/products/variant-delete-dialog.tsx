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
import type { ApiProductVariant } from '@/types';

interface VariantDeleteDialogProps {
  variant: ApiProductVariant | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function VariantDeleteDialog({
  variant,
  isDeleting,
  onClose,
  onConfirm,
}: VariantDeleteDialogProps) {
  return (
    <Dialog open={Boolean(variant)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Varyantı Silmek İstediğinize Emin Misiniz?</DialogTitle>
          <DialogDescription>
            &quot;{variant?.aroma} ({variant?.size.gram}g)&quot; varyantı kalıcı olarak silinecektir.
            Sipariş geçmişinde yer alan varyantlar silinemez.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Vazgeç
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Siliniyor...' : 'Evet, Varyantı Sil'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
