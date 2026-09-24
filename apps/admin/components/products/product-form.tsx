'use client';

import * as React from 'react';
import type { ApiProductDetail, CategoryTree, CreateProductInput } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MediaUploader } from './media-uploader';
import { ProductFormHeader } from './product-form-header';
import { ProductFormBasic } from './product-form-basic';
import { ProductFormContent } from './product-form-content';
import { ProductFormClassification } from './product-form-classification';
import { useProductForm } from './use-product-form';

export interface ProductFormProps {
  initialData?: ApiProductDetail;
  categories: CategoryTree[];
  onSubmit: (values: CreateProductInput) => Promise<void>;
  isSubmitting?: boolean;
}

export function ProductForm({
  initialData,
  categories,
  onSubmit,
  isSubmitting = false,
}: ProductFormProps) {
  const {
    form,
    errors,
    serverError,
    updateField,
    handleNameChange,
    handleSubmit,
  } = useProductForm({ initialData, onSubmit });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ProductFormHeader isEditing={Boolean(initialData)} isSubmitting={isSubmitting} />

      {serverError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProductFormBasic
            name={form.name}
            slug={form.slug}
            shortExplanation={form.shortExplanation}
            errors={errors}
            onNameChange={handleNameChange}
            onSlugChange={(slug) => {
              updateField('slugManuallyEdited', true);
              updateField('slug', slug);
            }}
            onShortExplanationChange={(val) => updateField('shortExplanation', val)}
          />

          <ProductFormContent
            usage={form.usage}
            features={form.features}
            description={form.description}
            errors={errors}
            onUsageChange={(val) => updateField('usage', val)}
            onFeaturesChange={(val) => updateField('features', val)}
            onDescriptionChange={(val) => updateField('description', val)}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ürün Görseli</CardTitle>
              <CardDescription className="text-xs">
                Katalog ve listeleme sayfalarında gösterilecek ana ürün görseli
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaUploader
                value={form.photoSrc}
                onChange={(photoSrc) => updateField('photoSrc', photoSrc)}
              />
            </CardContent>
          </Card>

          <ProductFormClassification
            categories={categories}
            mainCategoryId={form.mainCategoryId}
            subCategoryId={form.subCategoryId}
            tagsInput={form.tagsInput}
            isBestSeller={form.isBestSeller}
            bestSellerRank={form.bestSellerRank}
            errors={errors}
            onMainCategoryChange={(val) => {
              updateField('mainCategoryId', val);
              updateField('subCategoryId', '');
            }}
            onSubCategoryChange={(val) => updateField('subCategoryId', val)}
            onTagsChange={(val) => updateField('tagsInput', val)}
            onBestSellerChange={(val) => updateField('isBestSeller', val)}
            onBestSellerRankChange={(val) => updateField('bestSellerRank', val)}
          />
        </div>
      </div>
    </form>
  );
}
