import * as React from 'react';
import { Users } from 'lucide-react';

export function UsersTableEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
      <Users className="h-10 w-10 mb-3 opacity-30" />
      <p className="text-sm font-medium">Kullanıcı Bulunamadı</p>
      <p className="text-xs mt-1">Arama veya filtre kriterlerinizi değiştirmeyi deneyin.</p>
    </div>
  );
}
