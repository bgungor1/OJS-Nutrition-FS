'use client';

import React, { useState } from 'react';
import { ShoppingCart, Check, Plus, Minus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import { VariantSelector } from './variant-selector';
import { ProductPriceBox } from './product-price-box';
import { ProductTrustBadges } from './product-trust-badges';
import type { ApiProductVariant } from '@/types';

interface ProductActionsProps {
  productId?: string;
  variants: ApiProductVariant[];
  productName: string;
}

export const ProductActions: React.FC<ProductActionsProps> = ({
  productId,
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
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const addItem = useCartStore((state) => state.addItem);
  const isCartLoading = useCartStore((state) => state.isLoading);

  const handleAromaSelect = (aroma: string) => {
    setSelectedAroma(aroma);
    const matching = variants.find((v) => v.aroma === aroma);
    if (matching) {
      setSelectedVariantId(matching.id);
    }
  };

  const handleAddToCart = async () => {
    if (!currentVariant?.is_available || !currentVariant?.id) return;
    setIsAdding(true);
    const targetProductId = productId || currentVariant.id;
    const success = await addItem(targetProductId, currentVariant.id, quantity);
    setIsAdding(false);

    if (success) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2200);
    }
  };

  const isAvailable = currentVariant?.is_available ?? true;

  return (
    <div className="space-y-6 pt-2">
      <VariantSelector
        aromas={aromas}
        selectedAroma={selectedAroma}
        onSelectAroma={handleAromaSelect}
        availableVariants={availableVariants}
        selectedVariantId={selectedVariantId}
        onSelectVariantId={setSelectedVariantId}
      />

      <ProductPriceBox
        price={currentVariant?.price?.total_price || 0}
        originalPrice={currentVariant?.price?.discounted_price}
        discountPercentage={currentVariant?.price?.discount_percentage}
        servings={currentVariant?.size?.total_services || 1}
      />

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
          disabled={!isAvailable || isAdding || isCartLoading}
          className={`flex-1 font-bold transition-all h-11 cursor-pointer ${
            isAdded ? 'bg-green-600 hover:bg-green-700 text-white' : ''
          }`}
        >
          {isAdding ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Ekleniyor...
            </>
          ) : isAdded ? (
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

      <ProductTrustBadges />
    </div>
  );
};

export default ProductActions;
