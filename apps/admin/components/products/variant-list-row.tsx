'use client';

import * as React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import type { ApiProductVariant } from '@/types';
import { Edit2, Trash2, Layers } from 'lucide-react';

interface VariantListRowProps {
  variant: ApiProductVariant;
  onEdit: (variant: ApiProductVariant) => void;
  onDelete: (variant: ApiProductVariant) => void;
}

export function VariantListRow({ variant, onEdit, onDelete }: VariantListRowProps) {
  const hasDiscount =
    variant.price.discounted_price !== null &&
    variant.price.discounted_price < variant.price.total_price;

  return (
    <TableRow data-testid={`variant-row-${variant.id}`}>
      <TableCell>
        <div className="h-9 w-9 rounded border overflow-hidden bg-muted/40 shrink-0">
          {variant.photo_src ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={variant.photo_src.startsWith('http') ? variant.photo_src : `/${variant.photo_src}`}
              alt={variant.aroma}
              className="h-full w-full object-cover"
            />
          ) : (
            <Layers className="h-4 w-4 m-auto text-muted-foreground" />
          )}
        </div>
      </TableCell>
      <TableCell className="text-xs font-medium">{variant.aroma}</TableCell>
      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
        {variant.size.gram}g &bull; {variant.size.total_services} servis
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-xs font-semibold">
            {formatPrice(hasDiscount ? variant.price.discounted_price! : variant.price.total_price)}
          </span>
          {hasDiscount && (
            <span className="text-[10px] text-muted-foreground line-through">
              {formatPrice(variant.price.total_price)}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <Badge
          variant={variant.is_available ? 'success' : 'secondary'}
          className="text-[10px] px-1.5 py-0"
        >
          {variant.is_available ? 'Satışta' : 'Kapalı'}
        </Badge>
      </TableCell>
      <TableCell className="text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => onEdit(variant)}
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span className="sr-only">Düzenle</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(variant)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Sil</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
