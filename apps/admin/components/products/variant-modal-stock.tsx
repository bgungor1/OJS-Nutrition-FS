'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VariantModalStockProps {
  isAvailable: boolean;
  stockQuantity: number | '';
  onAvailableChange: (val: boolean) => void;
  onStockQuantityChange: (val: number | '') => void;
}

export function VariantModalStock({
  isAvailable,
  stockQuantity,
  onAvailableChange,
  onStockQuantityChange,
}: VariantModalStockProps) {
  return (
    <div className="flex items-center justify-between pt-2 border-t">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isAvailable"
          checked={isAvailable}
          onChange={(e) => onAvailableChange(e.target.checked)}
          className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
        />
        <Label htmlFor="isAvailable" className="text-xs font-normal cursor-pointer">
          Satışa Açık
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="stockQuantity" className="text-xs text-muted-foreground whitespace-nowrap">
          Stok Adedi:
        </Label>
        <Input
          id="stockQuantity"
          type="number"
          min={0}
          value={stockQuantity}
          onChange={(e) =>
            onStockQuantityChange(e.target.value === '' ? '' : Number(e.target.value))
          }
          className="w-20 text-xs text-right"
        />
      </div>
    </div>
  );
}
