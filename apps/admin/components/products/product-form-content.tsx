'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface ProductFormContentProps {
  usage: string;
  features: string;
  description: string;
  errors: Record<string, string>;
  onUsageChange: (usage: string) => void;
  onFeaturesChange: (features: string) => void;
  onDescriptionChange: (description: string) => void;
}

export function ProductFormContent({
  usage,
  features,
  description,
  errors,
  onUsageChange,
  onFeaturesChange,
  onDescriptionChange,
}: ProductFormContentProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Kullanım & Detaylı Açıklama</CardTitle>
        <CardDescription className="text-xs">
          Tüketici için hazırlanan özellikler ve kullanım yönergeleri
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="usage" className="text-xs">Kullanım Şekli</Label>
          <textarea
            id="usage"
            rows={3}
            value={usage}
            onChange={(e) => onUsageChange(e.target.value)}
            placeholder="1 ölçek (30g) ürünü 250ml soğuk su ile karıştırarak tüketiniz..."
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {errors.usage && <p className="text-[11px] text-destructive">{errors.usage}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="features" className="text-xs">Özellikler (Madde veya Satır Bazlı)</Label>
          <textarea
            id="features"
            rows={3}
            value={features}
            onChange={(e) => onFeaturesChange(e.target.value)}
            placeholder="24g protein / servis&#10;Düşük şeker oranı&#10;Hızlı sindirilen hammadde"
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {errors.features && <p className="text-[11px] text-destructive">{errors.features}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-xs">Detaylı Açıklama</Label>
          <textarea
            id="description"
            rows={5}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Ürünün içeriği, faydaları ve sporcu beslenmesindeki rolü hakkında detaylı metin..."
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {errors.description && (
            <p className="text-[11px] text-destructive">{errors.description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
