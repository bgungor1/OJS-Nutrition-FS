'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import { calculateCartTotals, formatPrice } from '@/lib/utils';
import { CartDrawerItem } from './cart-drawer-item';
import { CartDrawerEmpty } from './cart-drawer-empty';
import { CartDrawerShippingBar } from './cart-drawer-shipping-bar';
import type { CartItemResponse } from '@/types';

export const CartDrawer: React.FC = () => {
  const items = useCartStore((state) => state.items);
  const isDrawerOpen = useCartStore((state) => state.isDrawerOpen);
  const isLoading = useCartStore((state) => state.isLoading);
  const closeDrawer = useCartStore((state) => state.closeDrawer);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);

  const totals = calculateCartTotals(items);

  const handleIncrement = (item: CartItemResponse) => {
    void addItem(item.product_id, item.product_variant_id, 1);
  };

  const handleDecrement = (item: CartItemResponse) => {
    void removeItem(item.product_id, item.product_variant_id, 1);
  };

  const handleRemove = (item: CartItemResponse) => {
    void removeItem(item.product_id, item.product_variant_id, item.pieces);
  };

  return (
    <Sheet
      open={isDrawerOpen}
      onOpenChange={(open) => {
        if (!open) closeDrawer();
      }}
    >
      <SheetContent
        side="right"
        className="flex flex-col w-full sm:max-w-md p-0 gap-0"
      >
        <SheetHeader className="p-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <SheetTitle className="text-base font-bold">
              Sepetim ({totals.totalPieces} Ürün)
            </SheetTitle>
            <SheetDescription className="sr-only">
              Alışveriş sepetinizdeki ürünler ve sipariş özeti
            </SheetDescription>
          </div>

          <CartDrawerShippingBar totals={totals} />
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {items.length === 0 ? (
            <CartDrawerEmpty onClose={closeDrawer} />
          ) : (
            <div className="divide-y divide-border/60">
              {items.map((item) => (
                <CartDrawerItem
                  key={`${item.product_id}-${item.product_variant_id}`}
                  item={item}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                  onRemove={handleRemove}
                  disabled={isLoading}
                />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="p-4 border-t border-border bg-card/80 backdrop-blur-xs flex-col gap-3 sm:flex-col sm:space-x-0">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Ara Toplam</span>
                <span className="font-semibold text-foreground">
                  {formatPrice(totals.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Kargo Ücreti</span>
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
              <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-border">
                <span>Genel Toplam</span>
                <span className="text-base text-primary font-black">
                  {formatPrice(totals.grandTotal)}
                </span>
              </div>
            </div>

            <Button asChild size="lg" className="w-full font-bold h-11" onClick={closeDrawer}>
              <Link href="/payment" className="flex items-center justify-center gap-2">
                <span>Siparişi Onayla</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
