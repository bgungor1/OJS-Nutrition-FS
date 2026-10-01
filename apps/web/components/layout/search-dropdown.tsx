'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Loader2, ArrowRight } from 'lucide-react';
import { getImageUrl } from '@/lib/utils/image';
import { formatPrice } from '@/lib/utils/format';
import type { ApiProduct } from '@/types';

interface SearchDropdownProps {
  isOpen: boolean;
  query: string;
  isLoading: boolean;
  hasSearched: boolean;
  results: ApiProduct[];
  totalCount: number;
  onSelect: () => void;
  onViewAll: () => void;
}

export const SearchDropdown: React.FC<SearchDropdownProps> = ({
  isOpen,
  query,
  isLoading,
  hasSearched,
  results,
  totalCount,
  onSelect,
  onViewAll,
}) => {
  if (!isOpen || query.trim().length < 2) return null;

  return (
    <div
      role="listbox"
      aria-label="Arama Önerileri"
      className="absolute left-0 right-0 top-full mt-2 z-50 bg-background text-foreground rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
    >
      {isLoading ? (
        <div className="p-6 flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Ürünler aranıyor...</span>
        </div>
      ) : results.length > 0 ? (
        <div>
          <div className="px-4 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30 border-b border-border/40">
            Önerilen Ürünler
          </div>
          <div className="divide-y divide-border/40 max-h-80 overflow-y-auto">
            {results.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                onClick={onSelect}
                className="group flex items-center gap-3.5 p-3 hover:bg-muted/70 transition-colors"
              >
                <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-muted/40 border border-border/50">
                  <Image
                    src={getImageUrl(product.photo_src)}
                    alt={product.name}
                    fill
                    className="object-contain p-1 group-hover:scale-105 transition-transform"
                    sizes="48px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {product.name}
                  </p>
                  {product.short_explanation && (
                    <p className="text-xs text-muted-foreground truncate">
                      {product.short_explanation}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-foreground">
                    {formatPrice(
                      product.price_info.discounted_price ?? product.price_info.total_price,
                    )}
                  </span>
                  {product.price_info.discounted_price && (
                    <span className="block text-[11px] text-muted-foreground line-through">
                      {formatPrice(product.price_info.total_price)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <button
            type="button"
            onClick={onViewAll}
            className="w-full py-3 px-4 bg-muted/40 hover:bg-muted text-xs font-semibold text-primary flex items-center justify-center gap-1.5 transition-colors border-t border-border/50 cursor-pointer"
          >
            <span>Tüm sonuçları gör ({totalCount} ürün)</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : hasSearched ? (
        <div className="p-6 text-center text-sm text-muted-foreground">
          <Search className="h-7 w-7 mx-auto mb-2 text-muted-foreground/40" />
          <p className="font-semibold text-foreground">&quot;{query}&quot; ile eşleşen ürün bulunamadı</p>
          <p className="text-xs text-muted-foreground mt-1">
            Farklı bir arama terimi deneyebilir veya kategorilere göz atabilirsiniz.
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default SearchDropdown;
