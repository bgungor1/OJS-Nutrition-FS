'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { clientFetch } from '@/lib/api-client';
import type { ApiProduct, PaginatedResponse } from '@/types';

interface UseSearchBarOptions {
  onSearchComplete?: () => void;
  debounceMs?: number;
}

export function useSearchBar({ onSearchComplete, debounceMs = 300 }: UseSearchBarOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearchParam = searchParams?.get('search') || '';
  const [query, setQuery] = useState(currentSearchParam);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<ApiProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const containerRef = useRef<HTMLFormElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeSearchRef = useRef('');
  const isFirstRender = useRef(true);
  const isClearingRef = useRef(false);

  useEffect(() => { setQuery(currentSearchParam); }, [currentSearchParam]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const executeSearch = useCallback((searchTerm: string, navigateImmediately = false) => {
    const trimmed = searchTerm.trim();
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (trimmed) params.set('search', trimmed); else params.delete('search');
    params.delete('page');
    const queryString = params.toString();
    if (pathname.startsWith('/products')) {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    } else if (navigateImmediately && trimmed) {
      router.push(`/products?${queryString}`);
    }
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isClearingRef.current) {
      isClearingRef.current = false;
      return;
    }
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setIsOpen(false); setResults([]); setIsLoading(false); setHasSearched(false);
      if (pathname.startsWith('/products')) {
        debounceTimerRef.current = setTimeout(() => executeSearch(query, false), debounceMs);
      }
      return;
    }

    activeSearchRef.current = trimmed;
    debounceTimerRef.current = setTimeout(async () => {
      if (pathname.startsWith('/products')) executeSearch(query, false);
      setIsLoading(true);
      setIsOpen(true);
      try {
        const res = await clientFetch<PaginatedResponse<ApiProduct>>(
          `/products?search=${encodeURIComponent(trimmed)}&limit=5`,
        );
        if (activeSearchRef.current === trimmed) {
          setResults(res?.results || []);
          setTotalCount(res?.count || 0);
          setHasSearched(true);
          setIsLoading(false);
        }
      } catch {
        if (activeSearchRef.current === trimmed) {
          setResults([]); setTotalCount(0); setHasSearched(true); setIsLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query, debounceMs, pathname, executeSearch]);

  const navigateToProducts = (term: string) => {
    setIsOpen(false);
    if (pathname.startsWith('/products')) {
      executeSearch(term, true);
    } else if (term.trim()) {
      router.push(`/products?search=${encodeURIComponent(term.trim())}`);
    }
    onSearchComplete?.();
  };

  const handleClear = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    isClearingRef.current = true;
    setQuery('');
    setResults([]);
    setTotalCount(0);
    setHasSearched(false);
    setIsLoading(false);
    setIsOpen(false);
    if (pathname.startsWith('/products')) {
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.delete('search');
      params.delete('page');
      router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
    }
  };

  return {
    query,
    setQuery,
    isOpen,
    setIsOpen,
    results,
    totalCount,
    isLoading,
    hasSearched,
    containerRef,
    handleClear,
    handleViewAll: () => navigateToProducts(query),
    handleSubmit: (e: React.FormEvent) => {
      e.preventDefault();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      navigateToProducts(query);
    },
  };
}
