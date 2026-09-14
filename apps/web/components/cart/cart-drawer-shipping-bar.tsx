import React from 'react';
import { Truck } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { CartTotals } from '@/types';

interface CartDrawerShippingBarProps {
  totals: CartTotals;
}

export const CartDrawerShippingBar: React.FC<CartDrawerShippingBarProps> = ({ totals }) => {
  return (
    <div className="mt-2 rounded-lg bg-muted/50 p-2.5 space-y-1.5 text-left border border-border/50">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="flex items-center gap-1.5 text-foreground">
          <Truck className="h-3.5 w-3.5 text-primary" />
          {totals.isFreeShipping ? (
            <span className="text-primary font-bold">Kargo Ücretsiz!</span>
          ) : (
            <span>
              Ücretsiz Kargo İçin:{' '}
              <strong className="text-primary">
                {formatPrice(totals.remainingForFreeShipping)}
              </strong>
            </span>
          )}
        </span>
        <span className="text-[11px] text-muted-foreground">
          %{totals.freeShippingProgress}
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full bg-primary transition-all duration-300 rounded-full"
          style={{ width: `${totals.freeShippingProgress}%` }}
        />
      </div>
    </div>
  );
};

export default CartDrawerShippingBar;
