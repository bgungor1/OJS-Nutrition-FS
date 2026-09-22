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
import type { ApiProductVariant } from '@/types';

interface VariantDeleteDialogProps {
  variant: ApiProductVariant | null;
  isDeleting: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function VariantDeleteDialog({
  variant,
  isDeleting,
  error,
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
            {isDeleting ? 'Siliniyor...' : 'Evet, Varyantı Sil'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
