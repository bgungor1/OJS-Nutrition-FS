import React from 'react';
import { Package, Truck, ShieldCheck } from 'lucide-react';

interface InfoItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const DEFAULT_ITEMS: InfoItem[] = [
  {
    icon: <Package className="h-3.5 w-3.5 text-primary" />,
    title: 'AYNI GÜN KARGO',
    description: "16:00'dan önceki siparişlerde",
  },
  {
    icon: <Truck className="h-3.5 w-3.5 text-primary" />,
    title: 'ÜCRETSİZ KARGO',
    description: '750 TL ve üzeri siparişlerde',
  },
  {
    icon: <ShieldCheck className="h-3.5 w-3.5 text-primary" />,
    title: 'GÜVENLİ ALIŞVERİŞ',
    description: '1.000.000+ mutlu müşteri',
  },
];

export const InfoBanner: React.FC = () => {
  return (
    <aside
      aria-label="Avantaj ve Hizmet Bilgileri"
      className="border-t border-border/60 bg-muted/30 py-2 px-4"
    >
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-muted-foreground">
        {DEFAULT_ITEMS.map((item) => (
          <div key={item.title} className="flex items-center gap-1.5 font-medium">
            {item.icon}
            <strong className="font-semibold text-foreground">{item.title}</strong>
            <span className="hidden sm:inline">-</span>
            <span>{item.description}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default InfoBanner;
