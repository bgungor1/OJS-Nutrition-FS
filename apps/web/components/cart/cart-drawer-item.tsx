'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice, getImageUrl } from '@/lib/utils';
import type { CartItemResponse } from '@/types';

export interface CartDrawerItemProps {
  item: CartItemResponse;
  onIncrement: (item: CartItemResponse) => void;
  onDecrement: (item: CartItemResponse) => void;
  onRemove: (item: CartItemResponse) => void;
  disabled?: boolean;
}

export const CartDrawerItem: React.FC<CartDrawerItemProps> = ({
  item,
  onIncrement,
  onDecrement,
  onRemove,
  disabled = false,
}) => {
  const photoSrc = item.variant?.photo_src || item.product?.photo_src;
  const imageUrl = getImageUrl(photoSrc);

  const unitPrice =
    item.variant?.price?.discounted_price !== null &&
    item.variant?.price?.discounted_price !== undefined
      ? item.variant.price.discounted_price
      : item.variant?.price?.total_price || 0;

  const originalUnitPrice = item.variant?.price?.total_price;
  const hasDiscount =
    item.variant?.price?.discounted_price !== null &&
    item.variant?.price?.discounted_price !== undefined &&
    originalUnitPrice !== undefined &&
    item.variant.price.discounted_price < originalUnitPrice;

  const rowTotal = unitPrice * item.pieces;
  const originalRowTotal = (originalUnitPrice || 0) * item.pieces;
  const maxStock = item.variant?.stock_quantity ?? 99;
  const canIncrement = item.pieces < maxStock && !disabled;

  return (
    <div
      data-testid={`cart-drawer-item-${item.id}`}
      className="flex gap-3 py-3 border-b border-border/70 last:border-b-0"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/30">
        <Image
          src={imageUrl}
          alt={item.product?.name || 'Ürün'}
          fill
          sizes="80px"
          className="object-contain p-1"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-foreground truncate">
              {item.product?.name}
            </h4>
            <div className="flex flex-wrap gap-1 mt-1">
              {item.variant?.aroma && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {item.variant.aroma}
                </Badge>
              )}
              {item.variant?.size?.gram && (
                <span className="text-[11px] text-muted-foreground">
                  {item.variant.size.gram}g
                </span>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(item)}
            disabled={disabled}
            className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
            aria-label="Ürünü sepetten sil"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="flex items-center rounded-md border border-border bg-card">
            <button
              type="button"
              onClick={() => onDecrement(item)}
              disabled={disabled || item.pieces <= 1}
              className="px-2 py-1 text-muted-foreground hover:text-foreground disabled:opacity-40 cursor-pointer"
              aria-label="Adet azalt"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-6 text-center text-xs font-semibold text-foreground">
              {item.pieces}
            </span>
            <button
              type="button"
              onClick={() => onIncrement(item)}
              disabled={!canIncrement}
              className="px-2 py-1 text-muted-foreground hover:text-foreground disabled:opacity-40 cursor-pointer"
              aria-label="Adet artır"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <div className="text-right">
            <div className="text-sm font-bold text-primary">
              {formatPrice(rowTotal)}
            </div>
            {hasDiscount && (
              <div className="text-[11px] text-muted-foreground line-through">
                {formatPrice(originalRowTotal)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDrawerItem;
