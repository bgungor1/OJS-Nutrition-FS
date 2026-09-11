import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface CatalogHeaderProps {
  title: string;
  description?: string;
  categorySlug?: string;
  totalCount?: number;
}

export const CatalogHeader: React.FC<CatalogHeaderProps> = ({
  title,
  description,
  categorySlug,
  totalCount,
}) => {
  return (
    <div className="mb-8 space-y-4">
      <nav aria-label="Breadcrumb" className="flex items-center text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">
          Ana Sayfa
        </Link>
        <ChevronRight className="h-3 w-3 mx-1.5 text-muted-foreground/60" />
        {categorySlug ? (
          <>
            <Link href="/products" className="hover:text-primary transition-colors">
              Ürünler
            </Link>
            <ChevronRight className="h-3 w-3 mx-1.5 text-muted-foreground/60" />
            <span className="text-foreground font-medium capitalize">{title}</span>
          </>
        ) : (
          <span className="text-foreground font-medium">Tüm Ürünler</span>
        )}
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {totalCount !== undefined && (
          <span className="text-xs font-semibold text-muted-foreground self-start sm:self-auto">
            {totalCount} ürün listelendi
          </span>
        )}
      </div>
    </div>
  );
};

export default CatalogHeader;
