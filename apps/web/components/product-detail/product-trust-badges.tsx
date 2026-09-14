import React from 'react';
import { Truck, ShieldCheck } from 'lucide-react';

export const ProductTrustBadges: React.FC = () => {
  return (
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
  );
};

export default ProductTrustBadges;
