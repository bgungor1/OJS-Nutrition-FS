'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProductFormBasicProps {
  name: string;
  slug: string;
  shortExplanation: string;
  errors: Record<string, string>;
  onNameChange: (name: string) => void;
  onSlugChange: (slug: string) => void;
  onShortExplanationChange: (shortExplanation: string) => void;
}

export function ProductFormBasic({
  name,
  slug,
  shortExplanation,
  errors,
  onNameChange,
  onSlugChange,
  onShortExplanationChange,
}: ProductFormBasicProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Temel Bilgiler</CardTitle>
        <CardDescription className="text-xs">
          Ürünün adı, URL slug adresi ve kısa tanıtımı
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs">Ürün Adı</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Örn: Whey Protein Çikolata"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <p className="text-[11px] text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slug" className="text-xs">Slug (URL Tanımlayıcısı)</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            placeholder="Örn: whey-protein-cikolata"
            aria-invalid={Boolean(errors.slug)}
          />
          {errors.slug && <p className="text-[11px] text-destructive">{errors.slug}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="shortExplanation" className="text-xs">Kısa Açıklama</Label>
          <Input
            id="shortExplanation"
            value={shortExplanation}
            onChange={(e) => onShortExplanationChange(e.target.value)}
            placeholder="Kartlarda ve özet alanlarında gösterilecek kısa açıklama"
            aria-invalid={Boolean(errors.shortExplanation)}
          />
          {errors.shortExplanation && (
            <p className="text-[11px] text-destructive">{errors.shortExplanation}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
