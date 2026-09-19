'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { OrderStatus } from '@/types';

interface OrdersToolbarProps {
  search?: string;
  status?: OrderStatus;
  sort?: string;
}

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Tüm Durumlar' },
  { value: 'pending', label: 'Beklemede' },
  { value: 'processing', label: 'Hazırlanıyor' },
  { value: 'shipped', label: 'Kargoya Verildi' },
  { value: 'delivered', label: 'Teslim Edildi' },
  { value: 'cancelled', label: 'İptal Edildi' },
  { value: 'refunded', label: 'İade Edildi' },
];

const SORT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'date_desc', label: 'En Yeni Sipariş' },
  { value: 'date_asc', label: 'En Eski Sipariş' },
  { value: 'total_desc', label: 'Tutar (Yüksekten Düşüğe)' },
  { value: 'total_asc', label: 'Tutar (Düşükten Yükseğe)' },
];

export function OrdersToolbar({ search = '', status = '' as OrderStatus, sort = 'date_desc' }: OrdersToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchValue, setSearchValue] = React.useState(search);

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(window.location.search);
    params.delete('offset'); // Reset page to 0 on filter change

    Object.entries(updates).forEach(([key, val]) => {
      if (val) {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchValue.trim() || null });
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Sipariş No, Müşteri veya E-posta..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-8 h-9 text-sm"
        />
      </form>

      <div className="flex items-center gap-2">
        <select
          value={status || ''}
          onChange={(e) => updateFilters({ status: e.target.value || null })}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Sipariş durumuna göre filtrele"
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => updateFilters({ sort: e.target.value })}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Sıralama ölçütü"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
