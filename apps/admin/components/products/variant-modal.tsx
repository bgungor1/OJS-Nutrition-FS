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
import { MediaUploader } from './media-uploader';
import { VariantModalSize } from './variant-modal-size';
import { VariantModalPricing } from './variant-modal-pricing';
import { VariantModalStock } from './variant-modal-stock';
import { useVariantModalForm } from './use-variant-modal-form';
import type { ApiProductVariant, CreateVariantInput } from '@/types';
import { Loader2 } from 'lucide-react';

export interface VariantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ApiProductVariant | null;
  onSubmit: (values: CreateVariantInput) => Promise<void>;
  isSubmitting?: boolean;
}

export function VariantModal({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isSubmitting = false,
}: VariantModalProps) {
  const {
    form,
    errors,
    serverError,
    updateField,
    handlePriceOrServingsChange,
    handleSubmit,
  } = useVariantModalForm({ initialData, open, onSubmit, onOpenChange });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Varyantı Düzenle' : 'Yeni Varyant Ekle'}</DialogTitle>
          <DialogDescription className="text-xs">
            Aroma, gramaj, servis ve fiyat bilgilerini giriniz.
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="aroma" className="text-xs">Aroma / Tat</Label>
            <Input
              id="aroma"
              value={form.aroma}
              onChange={(e) => updateField('aroma', e.target.value)}
              placeholder="Örn: Çikolata, Muz, Çilek"
              aria-invalid={Boolean(errors.aroma)}
            />
            {errors.aroma && <p className="text-[11px] text-destructive">{errors.aroma}</p>}
          </div>

          <VariantModalSize
            gram={form.gram}
            pieces={form.pieces}
            totalServings={form.totalServings}
            errors={errors}
            onGramChange={(val) => updateField('gram', val)}
            onPiecesChange={(val) => updateField('pieces', val)}
            onTotalServingsChange={(val) => handlePriceOrServingsChange(form.totalPrice, val, 'totalServings')}
          />

          <VariantModalPricing
            totalPrice={form.totalPrice}
            discountedPrice={form.discountedPrice}
            pricePerServing={form.pricePerServing}
            errors={errors}
            onTotalPriceChange={(val) => handlePriceOrServingsChange(val, form.totalServings, 'totalPrice')}
            onDiscountedPriceChange={(val) => updateField('discountedPrice', val)}
            onPricePerServingChange={(val) => updateField('pricePerServing', val)}
          />

          <MediaUploader
            value={form.photoSrc}
            onChange={(url) => updateField('photoSrc', url)}
          />
          {errors.photoSrc && <p className="text-[11px] text-destructive">{errors.photoSrc}</p>}

          <VariantModalStock
            isAvailable={form.isAvailable}
            stockQuantity={form.stockQuantity}
            onAvailableChange={(val) => updateField('isAvailable', val)}
            onStockQuantityChange={(val) => updateField('stockQuantity', val)}
          />

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Vazgeç
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5">
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{initialData ? 'Güncelle' : 'Kaydet'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
