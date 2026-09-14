import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CartDrawerEmptyProps {
  onClose: () => void;
}

export const CartDrawerEmpty: React.FC<CartDrawerEmptyProps> = ({ onClose }) => {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center py-12 space-y-3">
      <div className="rounded-full bg-muted/60 p-4 text-muted-foreground">
        <ShoppingBag className="h-8 w-8 stroke-[1.5]" />
      </div>
      <h3 className="font-bold text-base text-foreground">
        Sepetiniz Henüz Boş
      </h3>
      <p className="text-xs text-muted-foreground max-w-[240px]">
        En sevdiğiniz supplement ve besinleri hemen keşfetmeye başlayın.
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={onClose}
        asChild
        className="mt-2"
      >
        <Link href="/products">Alışverişe Başla</Link>
      </Button>
    </div>
  );
};

export default CartDrawerEmpty;
