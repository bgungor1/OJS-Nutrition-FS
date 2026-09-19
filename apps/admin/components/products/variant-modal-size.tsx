'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VariantModalSizeProps {
  gram: number | '';
  pieces: number | '';
  totalServings: number | '';
  errors: Record<string, string>;
  onGramChange: (val: number | '') => void;
  onPiecesChange: (val: number | '') => void;
  onTotalServingsChange: (val: number | '') => void;
}

export function VariantModalSize({
  gram,
  pieces,
  totalServings,
  errors,
  onGramChange,
  onPiecesChange,
  onTotalServingsChange,
}: VariantModalSizeProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="gram" className="text-xs">Gramaj (g)</Label>
        <Input
          id="gram"
          type="number"
          min={1}
          value={gram}
          onChange={(e) => onGramChange(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="1000"
          aria-invalid={Boolean(errors.gram)}
        />
        {errors.gram && <p className="text-[11px] text-destructive">{errors.gram}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pieces" className="text-xs">Adet</Label>
        <Input
          id="pieces"
          type="number"
          min={1}
          value={pieces}
          onChange={(e) => onPiecesChange(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="1"
          aria-invalid={Boolean(errors.pieces)}
        />
        {errors.pieces && <p className="text-[11px] text-destructive">{errors.pieces}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="totalServings" className="text-xs">Porsiyon / Servis Sayısı</Label>
        <Input
          id="totalServings"
          type="number"
          min={1}
          value={totalServings}
          onChange={(e) => onTotalServingsChange(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="30"
          aria-invalid={Boolean(errors.totalServings)}
        />
        {errors.totalServings && (
          <p className="text-[11px] text-destructive">{errors.totalServings}</p>
        )}
      </div>
    </div>
  );
}
