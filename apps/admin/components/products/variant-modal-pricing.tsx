'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VariantModalPricingProps {
  totalPrice: number | '';
  discountedPrice: number | '';
  pricePerServing: number | '';
  errors: Record<string, string>;
  onTotalPriceChange: (val: number | '') => void;
  onDiscountedPriceChange: (val: number | '') => void;
  onPricePerServingChange: (val: number | '') => void;
}

export function VariantModalPricing({
  totalPrice,
  discountedPrice,
  pricePerServing,
  errors,
  onTotalPriceChange,
  onDiscountedPriceChange,
  onPricePerServingChange,
}: VariantModalPricingProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="totalPrice" className="text-xs">Satış Fiyatı (TL)</Label>
        <Input
          id="totalPrice"
          type="number"
          min={0}
          step="0.01"
          value={totalPrice}
          onChange={(e) => onTotalPriceChange(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="799.00"
          aria-invalid={Boolean(errors.totalPrice)}
        />
        {errors.totalPrice && <p className="text-[11px] text-destructive">{errors.totalPrice}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="discountedPrice" className="text-xs">İndirimli Fiyat (TL)</Label>
        <Input
          id="discountedPrice"
          type="number"
          min={0}
          step="0.01"
          value={discountedPrice}
          onChange={(e) => onDiscountedPriceChange(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="İsteğe bağlı"
          aria-invalid={Boolean(errors.discountedPrice)}
        />
        {errors.discountedPrice && (
          <p className="text-[11px] text-destructive">{errors.discountedPrice}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pricePerServing" className="text-xs">Porsiyon Fiyatı (TL)</Label>
        <Input
          id="pricePerServing"
          type="number"
          min={0}
          step="0.01"
          value={pricePerServing}
          onChange={(e) => onPricePerServingChange(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="Otomatik"
          aria-invalid={Boolean(errors.pricePerServing)}
        />
        {errors.pricePerServing && (
          <p className="text-[11px] text-destructive">{errors.pricePerServing}</p>
        )}
      </div>
    </div>
  );
}
