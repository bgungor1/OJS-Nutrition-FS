import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ProductPriceBoxProps {
  price: number;
  originalPrice?: number | null;
  discountPercentage?: number | null;
  servings?: number;
}

export const ProductPriceBox: React.FC<ProductPriceBoxProps> = ({
  price,
  originalPrice,
  discountPercentage,
  servings = 1,
}) => {
  return (
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
  );
};

export default ProductPriceBox;
