import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CatalogPaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  query?: Record<string, string | undefined>;
}

export const CatalogPagination: React.FC<CatalogPaginationProps> = ({
  currentPage,
  totalPages,
  baseUrl,
  query = {},
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, val]) => {
      if (val !== undefined && key !== 'page') {
        params.set(key, val);
      }
    });
    if (page > 1) {
      params.set('page', page.toString());
    }
    const qs = params.toString();
    return qs ? `${baseUrl}?${qs}` : baseUrl;
  };

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (currentPage <= 3) return i + 1;
    if (currentPage >= totalPages - 2) return totalPages - 4 + i;
    return currentPage - 2 + i;
  });

  return (
    <nav aria-label="Sayfalama" className="mt-10 flex items-center justify-center gap-1.5">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        className="h-8 w-8 p-0"
        asChild={currentPage > 1}
      >
        {currentPage > 1 ? (
          <Link href={createPageUrl(currentPage - 1)} aria-label="Önceki sayfa">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {pages.map((pageNum) => {
        const isActive = pageNum === currentPage;
        return (
          <Button
            key={pageNum}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            className="h-8 w-8 p-0 text-xs font-semibold"
            asChild={!isActive}
          >
            {!isActive ? (
              <Link href={createPageUrl(pageNum)} aria-label={`Sayfa ${pageNum}`}>
                {pageNum}
              </Link>
            ) : (
              <span>{pageNum}</span>
            )}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        className="h-8 w-8 p-0"
        asChild={currentPage < totalPages}
      >
        {currentPage < totalPages ? (
          <Link href={createPageUrl(currentPage + 1)} aria-label="Sonraki sayfa">
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    </nav>
  );
};

export default CatalogPagination;
