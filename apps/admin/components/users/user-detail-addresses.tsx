import * as React from 'react';
import { MapPin } from 'lucide-react';
import type { AdminUserDetailAddress } from '@/types';

interface UserDetailAddressesProps {
  addresses: AdminUserDetailAddress[];
}

export function UserDetailAddresses({ addresses }: UserDetailAddressesProps) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-medium text-sm">Kayıtlı Adresler</h2>
        <span className="ml-auto text-xs text-muted-foreground">{addresses.length} adres</span>
      </div>

      {addresses.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          Kayıtlı adres bulunmuyor.
        </p>
      ) : (
        <ul className="divide-y">
          {addresses.map((address) => (
            <li key={address.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{address.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{address.fullAddress}</p>
                </div>
                {address.isDefault && (
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 shrink-0">
                    Varsayılan
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
