'use client';

import React, { Suspense } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SearchDropdown } from './search-dropdown';
import { useSearchBar } from './use-search-bar';

interface SearchBarProps {
  className?: string;
  onSearchComplete?: () => void;
  debounceMs?: number;
}

const SearchBarFallback: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div role="search" aria-label="Ürün Arama" className={`relative w-full max-w-md ${className}`}>
    <div className="relative flex items-center">
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        placeholder="Aradığınız ürünü veya kategoriyi yazın..."
        disabled
        className="h-10 pl-9 pr-8 text-sm bg-muted/40 border-border rounded-full [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
      />
    </div>
  </div>
);

const SearchBarInner: React.FC<SearchBarProps> = ({
  className = '',
  onSearchComplete,
  debounceMs = 300,
}) => {
  const {
    query,
    setQuery,
    isOpen,
    setIsOpen,
    results,
    totalCount,
    isLoading,
    hasSearched,
    containerRef,
    handleSubmit,
    handleClear,
    handleViewAll,
  } = useSearchBar({ onSearchComplete, debounceMs });

  return (
    <form
      ref={containerRef}
      onSubmit={handleSubmit}
      onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
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
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          className="h-10 pl-9 pr-8 text-sm bg-muted/40 border-border focus-visible:ring-1 focus-visible:ring-primary rounded-full [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
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

      <SearchDropdown
        isOpen={isOpen}
        query={query}
        isLoading={isLoading}
        hasSearched={hasSearched}
        results={results}
        totalCount={totalCount}
        onSelect={() => {
          setIsOpen(false);
          onSearchComplete?.();
        }}
        onViewAll={handleViewAll}
      />
    </form>
  );
};

export const SearchBar: React.FC<SearchBarProps> = (props) => (
  <Suspense fallback={<SearchBarFallback className={props.className} />}>
    <SearchBarInner {...props} />
  </Suspense>
);

export default SearchBar;
