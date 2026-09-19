import * as React from 'react';
import { PackageX } from 'lucide-react';

export function OrdersTableEmpty() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-card text-card-foreground">
      <PackageX className="h-10 w-10 text-muted-foreground mb-3" />
      <h3 className="text-base font-semibold">Sipariş Bulunamadı</h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-sm">
        Aradığınız kriterlere uygun herhangi bir sipariş kaydı bulunmuyor. Filtrelerinizi temizleyerek tekrar deneyebilirsiniz.
      </p>
    </div>
  );
}
