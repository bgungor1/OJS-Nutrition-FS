import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CheckoutEmpty: React.FC = () => {
  return (
    <div className="max-w-md mx-auto py-16 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-muted/60 mx-auto flex items-center justify-center text-muted-foreground">
        <ShoppingBag className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold text-foreground">Sepetiniz Boş</h2>
      <p className="text-sm text-muted-foreground">
        Ödeme adımına geçmeden önce sepetinize en az bir ürün eklemelisiniz.
      </p>
      <Button asChild className="gap-2">
        <Link href="/products">
          <ArrowLeft className="h-4 w-4" />
          Alışverişe Başla
        </Link>
      </Button>
    </div>
  );
};

export default CheckoutEmpty;
