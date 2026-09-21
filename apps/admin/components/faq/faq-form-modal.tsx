'use client';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFaqForm } from './use-faq-form';
import type { FaqFormValues } from '@/lib/schemas/faq';
import type { FaqItem } from '@/types';

interface FaqFormModalProps {
  open: boolean;
  faq?: FaqItem | null;
  onClose: () => void;
  onSubmit: (values: FaqFormValues) => Promise<void>;
}

export function FaqFormModal({ open, faq, onClose, onSubmit }: FaqFormModalProps) {
  const isEditing = Boolean(faq);

  const {
    question,
    setQuestion,
    answer,
    setAnswer,
    category,
    setCategory,
    sortOrder,
    setSortOrder,
    errors,
    isSubmitting,
    handleSubmit,
  } = useFaqForm({
    initialFaq: faq,
    onSubmit,
    onSuccess: onClose,
  });

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'SSS Maddesini Düzenle' : 'Yeni SSS Maddesi Ekle'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Sıkça sorulan soru ve yanıt detaylarını düzenleyin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {errors.form}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="faq-question">Soru Metni *</Label>
            <Input
              id="faq-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Örn: Siparişim ne zaman kargoya verilir?"
              disabled={isSubmitting}
            />
            {errors.question && (
              <p className="text-xs text-destructive">{errors.question}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="faq-category">Kategori *</Label>
              <select
                id="faq-category"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as 'genel' | 'urunler' | 'kargo')
                }
                disabled={isSubmitting}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="genel">Genel</option>
                <option value="urunler">Ürünler</option>
                <option value="kargo">Kargo & Teslimat</option>
              </select>
              {errors.category && (
                <p className="text-xs text-destructive">{errors.category}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="faq-sort-order">Sıralama İndeksi</Label>
              <Input
                id="faq-sort-order"
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                disabled={isSubmitting}
              />
              {errors.sortOrder && (
                <p className="text-xs text-destructive">{errors.sortOrder}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="faq-answer">Detaylı Yanıt *</Label>
            <textarea
              id="faq-answer"
              rows={4}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Sorunun ayrıntılı ve açıklayıcı yanıtı..."
              disabled={isSubmitting}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring resize-y"
            />
            {errors.answer && (
              <p className="text-xs text-destructive">{errors.answer}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Vazgeç
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Kaydediliyor...'
                : isEditing
                  ? 'Güncelle'
                  : 'Kaydet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
