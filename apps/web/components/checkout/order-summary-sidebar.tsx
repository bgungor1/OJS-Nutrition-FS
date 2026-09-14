'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldCheck, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice, getImageUrl } from '@/lib/utils';
import type { CartItemResponse, CartTotals } from '@/types';

interface OrderSummarySidebarProps {
  items: CartItemResponse[];
  totals: CartTotals;
  isSubmitting: boolean;
  onSubmit: () => void;
  disabled?: boolean;
}

export const OrderSummarySidebar: React.FC<OrderSummarySidebarProps> = ({
  items,
  totals,
  isSubmitting,
  onSubmit,
  disabled = false,
}) => {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-6 shadow-xs sticky top-6">
      <div className="border-b border-border/80 pb-4">
        <h3 className="font-bold text-base text-foreground">
          Sipariş Özeti ({totals.totalPieces} Ürün)
        </h3>
      </div>

      <div className="max-h-60 overflow-y-auto divide-y divide-border/60 pr-1">
        {items.map((item) => {
          const photoSrc = item.variant?.photo_src || item.product?.photo_src;
          const imageUrl = getImageUrl(photoSrc);
          const unitPrice =
            item.variant?.price?.discounted_price ??
            item.variant?.price?.total_price ??
            0;
          const lineTotal = unitPrice * item.pieces;

          return (
            <div
              key={`${item.product_id}-${item.product_variant_id}`}
              className="py-3 first:pt-0 last:pb-0 flex items-center gap-3"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/20">
                <Image
                  src={imageUrl}
                  alt={item.product?.name || 'Ürün'}
                  fill
                  sizes="48px"
                  className="object-contain p-0.5"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {item.product?.name}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {item.variant?.aroma} • {item.pieces} Adet
                </p>
              </div>

              <span className="text-xs font-bold text-foreground shrink-0">
                {formatPrice(lineTotal)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="space-y-2 border-t border-border/80 pt-4 text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>Ara Toplam</span>
          <span className="font-semibold text-foreground">
            {formatPrice(totals.subtotal)}
          </span>
        </div>

        <div className="flex justify-between text-muted-foreground">
          <span>Kargo Bedeli</span>
          <span className="font-semibold text-foreground">
            {totals.isFreeShipping ? (
              <span className="text-primary font-bold">Ücretsiz</span>
            ) : (
              formatPrice(totals.shippingFee)
            )}
          </span>
        </div>

        {totals.totalSavings > 0 && (
          <div className="flex justify-between text-primary font-medium">
            <span>Toplam Kazanç</span>
            <span>-{formatPrice(totals.totalSavings)}</span>
          </div>
        )}

        <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
          <span>Genel Toplam</span>
          <span className="text-primary font-black">
            {formatPrice(totals.grandTotal)}
          </span>
        </div>
      </div>

      <Button
        type="button"
        size="lg"
        onClick={onSubmit}
        disabled={disabled || isSubmitting || items.length === 0}
        className="w-full h-12 text-sm font-bold gap-2 cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Sipariş İşleniyor...</span>
          </>
        ) : (
          <>
            <span>Siparişi Onayla</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      <div className="pt-2 border-t border-border/50 flex flex-col gap-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>256-Bit SSL sertifikası ile %100 güvenli ödeme</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>3D Secure altyapısı ve kart güvenliği</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummarySidebar;
