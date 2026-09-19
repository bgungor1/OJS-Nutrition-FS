'use client';

import * as React from 'react';
import Link from 'next/link';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import type { ApiProduct } from '@/types';
import { Edit3, Trash2, Star, Package } from 'lucide-react';

interface ProductTableRowProps {
  product: ApiProduct;
  onDelete?: (product: ApiProduct) => void;
}

export function ProductTableRow({ product, onDelete }: ProductTableRowProps) {
  const hasDiscount =
    product.price_info.discounted_price !== null &&
    product.price_info.discounted_price < product.price_info.total_price;

  return (
    <TableRow data-testid={`product-row-${product.id}`}>
      <TableCell>
        <div className="h-10 w-10 rounded border overflow-hidden bg-muted/40 shrink-0">
          {product.photo_src ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={product.photo_src.startsWith('http') ? product.photo_src : `/${product.photo_src}`}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <Package className="h-5 w-5 m-auto text-muted-foreground" />
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-foreground line-clamp-1">
            {product.name}
          </span>
          <span className="text-[11px] text-muted-foreground line-clamp-1">
            {product.short_explanation}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground font-mono">
        /{product.slug}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-xs font-semibold">
            {formatPrice(
              hasDiscount
                ? product.price_info.discounted_price!
                : product.price_info.total_price,
            )}
          </span>
          {hasDiscount && (
            <span className="text-[10px] text-muted-foreground line-through">
              {formatPrice(product.price_info.total_price)}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <div className="flex items-center gap-1 text-xs">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-medium">{product.average_star.toFixed(1)}</span>
          <span className="text-[10px] text-muted-foreground">
            ({product.comment_count})
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-xs">
            <Link href={`/products/${product.slug}`}>
              <Edit3 className="h-3.5 w-3.5 mr-1" />
              <span>Düzenle</span>
            </Link>
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(product)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="sr-only">Ürünü Sil</span>
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
