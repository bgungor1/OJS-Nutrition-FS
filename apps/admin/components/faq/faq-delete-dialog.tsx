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
import type { FaqItem } from '@/types';

interface FaqDeleteDialogProps {
  faq: FaqItem | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function FaqDeleteDialog({
  faq,
  isDeleting,
  onClose,
  onConfirm,
}: FaqDeleteDialogProps) {
  return (
    <Dialog open={Boolean(faq)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>SSS Maddesini Sil</DialogTitle>
          <DialogDescription>
            &quot;{faq?.question}&quot; sorusu silinecektir. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Vazgeç
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
