'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'newest', label: 'En Yeniler' },
  { value: 'price_asc', label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price_desc', label: 'Fiyat: Yüksekten Düşüğe' },
  { value: 'rating', label: 'Müşteri Puanına Göre' },
];

export const CatalogSort: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'newest';

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (newSort && newSort !== 'newest') {
      params.set('sort', newSort);
    } else {
      params.delete('sort');
    }

    params.delete('page');

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
      <label htmlFor="sort-select" className="text-muted-foreground whitespace-nowrap">
        Sırala:
      </label>
      <select
        id="sort-select"
        value={currentSort}
        onChange={handleSortChange}
        className="h-8 rounded-lg border border-border bg-card px-2 text-xs font-medium text-foreground focus:border-primary focus:outline-hidden"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CatalogSort;
