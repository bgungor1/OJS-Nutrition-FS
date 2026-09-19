import * as React from 'react';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ProductForm } from '@/components/products/product-form';
import { listCategories } from '@/lib/api/products';
import { createProductAction } from '../actions';
import type { CreateProductInput } from '@/types';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const categories = await listCategories();

  const handleCreate = async (values: CreateProductInput) => {
    'use server';
    const created = await createProductAction(values);
    redirect(`/products/${created.slug}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yeni Ürün Ekle"
        description="Kataloğa yeni bir ürün tanımı oluşturun. Varyantlar ürün kaydedildikten sonra düzenleme ekranından eklenecektir."
      />

      <ProductForm categories={categories} onSubmit={handleCreate} />
    </div>
  );
}
