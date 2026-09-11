'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  className?: string;
  onSearchComplete?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  className = '',
  onSearchComplete,
}) => {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    router.push(`/products?search=${encodeURIComponent(trimmed)}`);
    if (onSearchComplete) {
      onSearchComplete();
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <form
      onSubmit={handleSearch}
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
          className="h-10 pl-9 pr-8 text-sm bg-muted/40 border-border focus-visible:ring-1 focus-visible:ring-primary rounded-full"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 text-muted-foreground hover:text-foreground"
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
