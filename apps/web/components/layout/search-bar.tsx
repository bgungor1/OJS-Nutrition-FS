'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  className?: string;
  onSearchComplete?: () => void;
  debounceMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  className = '',
  onSearchComplete,
  debounceMs = 300,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearchParam = searchParams?.get('search') || '';
  const [query, setQuery] = useState(currentSearchParam);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);

  // URL'deki search parametresi değiştiğinde input state'ini senkronize et
  useEffect(() => {
    setQuery(currentSearchParam);
  }, [currentSearchParam]);

  const executeSearch = useCallback(
    (searchTerm: string, navigateImmediately = false) => {
      const trimmed = searchTerm.trim();

      // Mevcut arama parametrelerini koru
      const params = new URLSearchParams(searchParams?.toString() || '');

      if (trimmed) {
        params.set('search', trimmed);
        params.delete('page'); // Arama değiştiğinde 1. sayfaya dön
      } else {
        params.delete('search');
        params.delete('page');
      }

      const queryString = params.toString();

      // Kullanıcı zaten ürünler sayfasındaysa mevcut sayfayı güncelle
      if (pathname.startsWith('/products')) {
        const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
        router.replace(targetUrl, { scroll: false });
      } else if (navigateImmediately && trimmed) {
        // Başka sayfadaysa ve Enter/submit yapıldıysa ürünler sayfasına yönlendir
        router.push(`/products?${queryString}`);
      }
    },
    [pathname, router, searchParams],
  );

  // Debounce ile canlı arama (Kullanıcı ürünler sayfasındayken 300ms sonra tetiklenir)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (pathname.startsWith('/products')) {
      debounceTimerRef.current = setTimeout(() => {
        executeSearch(query, false);
      }, debounceMs);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, debounceMs, pathname, executeSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = query.trim();
    if (pathname.startsWith('/products')) {
      executeSearch(trimmed, true);
    } else if (trimmed) {
      router.push(`/products?search=${encodeURIComponent(trimmed)}`);
    }

    onSearchComplete?.();
  };

  const handleClear = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setQuery('');

    if (pathname.startsWith('/products')) {
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.delete('search');
      params.delete('page');
      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(targetUrl, { scroll: false });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Ürün Arama"
      className={`relative w-full max-w-md ${className}`}
    >
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Aradığınız ürünü veya kategoriyi yazın..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-10 pl-9 pr-8 text-sm bg-muted/40 border-border focus-visible:ring-1 focus-visible:ring-primary rounded-full [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
            aria-label="Aramayı Temizle"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;

