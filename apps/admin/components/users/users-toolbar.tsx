'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Role } from '@/types';

interface UsersToolbarProps {
  search?: string;
  role?: Role | 'all';
}

const ROLE_FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'Tüm Roller' },
  { value: 'customer', label: 'Müşteri' },
  { value: 'admin', label: 'Yönetici' },
];

export function UsersToolbar({ search = '', role = 'all' }: UsersToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = React.useState(search);

  const updateParams = React.useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('offset');
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      updateParams('search', searchValue);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchValue, updateParams]);

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="users-search-input"
          placeholder="İsim, soyisim veya e-posta ara..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-9"
        />
      </div>

      <select
        id="users-role-filter"
        value={role}
        onChange={(e) => updateParams('role', e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:w-40"
      >
        {ROLE_FILTER_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
