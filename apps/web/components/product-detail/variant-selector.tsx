'use client';

import React from 'react';
import type { ApiProductVariant } from '@/types';

interface VariantSelectorProps {
  aromas: string[];
  selectedAroma: string;
  onSelectAroma: (aroma: string) => void;
  availableVariants: ApiProductVariant[];
  selectedVariantId: string;
  onSelectVariantId: (id: string) => void;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  aromas,
  selectedAroma,
  onSelectAroma,
  availableVariants,
  selectedVariantId,
  onSelectVariantId,
}) => {
  return (
    <div className="space-y-6">
      {aromas.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">
            Aroma: <span className="text-foreground font-bold">{selectedAroma}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {aromas.map((aroma) => {
              const isSelected = selectedAroma === aroma;
              return (
                <button
                  key={aroma}
                  type="button"
                  onClick={() => onSelectAroma(aroma)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-border/80'
                  }`}
                >
                  {aroma}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {availableVariants.length > 1 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">
            Boyut Seçimi
          </label>
          <div className="flex flex-wrap gap-2">
            {availableVariants.map((v) => {
              const isSelected = v.id === selectedVariantId;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onSelectVariantId(v.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-left ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div>{v.size.gram}g</div>
                  <div className="text-[10px] text-muted-foreground">
                    {v.size.total_services} Servis
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantSelector;
