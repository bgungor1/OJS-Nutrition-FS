'use client';

import React, { useState } from 'react';
import { ShoppingCart, Check, Plus, Minus, Truck, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ApiProductVariant } from '@/types';

interface ProductActionsProps {
  variants: ApiProductVariant[];
  productName: string;
}

export const ProductActions: React.FC<ProductActionsProps> = ({
  variants,
}) => {
  const aromas = Array.from(new Set(variants.map((v) => v.aroma).filter(Boolean)));
  const [selectedAroma, setSelectedAroma] = useState<string>(aromas[0] || '');

  const availableVariants = variants.filter(
    (v) => !selectedAroma || v.aroma === selectedAroma,
  );

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    availableVariants[0]?.id || variants[0]?.id || '',
  );

  const currentVariant =
    variants.find((v) => v.id === selectedVariantId) ||
    availableVariants[0] ||
    variants[0];

  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  const handleAromaSelect = (aroma: string) => {
    setSelectedAroma(aroma);
    const matching = variants.find((v) => v.aroma === aroma);
    if (matching) {
      setSelectedVariantId(matching.id);
    }
  };

  const handleAddToCart = () => {
    if (!currentVariant?.is_available) return;
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2200);
  };

  const price = currentVariant?.price?.total_price || 0;
  const originalPrice = currentVariant?.price?.discounted_price;
  const discountPercentage = currentVariant?.price?.discount_percentage;
  const servings = currentVariant?.size?.total_services || 1;
  const isAvailable = currentVariant?.is_available ?? true;

  return (
    <div className="space-y-6 pt-2">
      {aromas.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">
            Aroma: <span className="text-foreground font-bold">{selectedAroma}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {aromas.map((aroma) => {
              const isSelected = selectedAroma === aroma;
              return (
                <button
                  key={aroma}
                  type="button"
                  onClick={() => handleAromaSelect(aroma)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${isSelected
                    ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-border/80'
                    }`}
                >
                  {aroma}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {availableVariants.length > 1 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">
            Boyut Seçimi
          </label>
          <div className="flex flex-wrap gap-2">
            {availableVariants.map((v) => {
              const isSelected = v.id === currentVariant?.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-left ${isSelected
                    ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <div>{v.size.gram}g</div>
                  <div className="text-[10px] text-muted-foreground">{v.size.total_services} Servis</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-xl bg-muted/40 border border-border p-4 space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-primary">
            {price.toLocaleString('tr-TR')} TL
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-muted-foreground line-through">
              {originalPrice.toLocaleString('tr-TR')} TL
            </span>
          )}
          {Boolean(discountPercentage && discountPercentage > 0) && (
            <Badge variant="destructive" className="text-[10px] font-bold">
              %{discountPercentage} İndirim
            </Badge>
          )}
        </div>
        {servings > 1 && (
          <p className="text-[11px] text-muted-foreground">
            Servis Başına: ~{(price / servings).toFixed(2)} TL
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-lg border border-border bg-card h-11">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 text-muted-foreground hover:text-foreground disabled:opacity-50"
            disabled={quantity <= 1}
            aria-label="Adet azalt"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-8 text-center text-sm font-semibold text-foreground">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="px-3 text-muted-foreground hover:text-foreground"
            aria-label="Adet artır"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <Button
          size="lg"
          onClick={handleAddToCart}
          disabled={!isAvailable}
          className={`flex-1 font-bold transition-all h-11 ${isAdded ? 'bg-green-600 hover:bg-green-700 text-white' : ''
            }`}
        >
          {isAdded ? (
            <>
              <Check className="h-5 w-5 mr-2" />
              Sepete Eklendi
            </>
          ) : !isAvailable ? (
            'Tükendi'
          ) : (
            <>
              <ShoppingCart className="h-5 w-5 mr-2" />
              Sepete Ekle
            </>
          )}
        </Button>
      </div>

      <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Truck className="h-4 w-4 text-primary shrink-0" />
          <span>Aynı gün ücretsiz kargo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
          <span>256-Bit SSL güvenli alışveriş</span>
        </div>
      </div>
    </div>
  );
};

export default ProductActions;
