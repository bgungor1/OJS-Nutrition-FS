'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CategoryTree } from '@/types';

interface ProductFormClassificationProps {
  categories: CategoryTree[];
  mainCategoryId: string;
  subCategoryId: string;
  tagsInput: string;
  isBestSeller: boolean;
  bestSellerRank: number | '';
  errors: Record<string, string>;
  onMainCategoryChange: (id: string) => void;
  onSubCategoryChange: (id: string) => void;
  onTagsChange: (tags: string) => void;
  onBestSellerChange: (isBestSeller: boolean) => void;
  onBestSellerRankChange: (rank: number | '') => void;
}

export function ProductFormClassification({
  categories,
  mainCategoryId,
  subCategoryId,
  tagsInput,
  isBestSeller,
  bestSellerRank,
  errors,
  onMainCategoryChange,
  onSubCategoryChange,
  onTagsChange,
  onBestSellerChange,
  onBestSellerRankChange,
}: ProductFormClassificationProps) {
  const activeMainCategory = categories.find((c) => c.id === mainCategoryId);
  const availableSubCategories = activeMainCategory?.subCategories || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Kategori & Etiketler</CardTitle>
          <CardDescription className="text-xs">Katalog sınıflandırması</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="mainCategoryId" className="text-xs">Ana Kategori</Label>
            <select
              id="mainCategoryId"
              value={mainCategoryId}
              onChange={(e) => onMainCategoryChange(e.target.value)}
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Kategori Seçiniz</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.mainCategoryId && (
              <p className="text-[11px] text-destructive">{errors.mainCategoryId}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="subCategoryId" className="text-xs">Alt Kategori</Label>
            <select
              id="subCategoryId"
              value={subCategoryId}
              disabled={!mainCategoryId}
              onChange={(e) => onSubCategoryChange(e.target.value)}
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
            >
              <option value="">Alt Kategori Seçiniz</option>
              {availableSubCategories.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.subCategoryId && (
              <p className="text-[11px] text-destructive">{errors.subCategoryId}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tags" className="text-xs">Etiketler (Virgülle Ayırın)</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => onTagsChange(e.target.value)}
              placeholder="PROTEİN, WHEY, İZOLAT"
            />
            {errors.tags && <p className="text-[11px] text-destructive">{errors.tags}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Öne Çıkarma (Best Seller)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isBestSeller"
              checked={isBestSeller}
              onChange={(e) => onBestSellerChange(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
            />
            <Label htmlFor="isBestSeller" className="text-xs font-normal cursor-pointer">
              Çok Satanlar (Best Seller) vitrinine ekle
            </Label>
          </div>

          {isBestSeller && (
            <div className="space-y-1.5">
              <Label htmlFor="bestSellerRank" className="text-xs">Vitrin Sıralaması</Label>
              <Input
                id="bestSellerRank"
                type="number"
                min={1}
                value={bestSellerRank}
                onChange={(e) =>
                  onBestSellerRankChange(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="Örn: 1, 2, 3"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
