import React from 'react';
import Link from 'next/link';
import { Package, ArrowRight, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ThankYouActions: React.FC = () => {
  return (
    <div className="space-y-3 pt-2">
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="flex-1 gap-2">
          <Link href="/account/orders">
            <Package className="h-4 w-4" />
            Siparişlerime Git
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1 gap-2">
          <Link href="/products">
            <ArrowRight className="h-4 w-4" />
            Alışverişe Devam Et
          </Link>
        </Button>
      </div>

      <div className="text-center">
        <Link
          href="/contact"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Siparişinizle ilgili bir sorun mu var? Bize Ulaşın</span>
        </Link>
      </div>
    </div>
  );
};

export default ThankYouActions;
