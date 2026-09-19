import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { ProductTable } from '@/components/products/product-table';
import { ProductsToolbar } from '@/components/products/products-toolbar';
import { ProductsPagination } from '@/components/products/products-pagination';
import { listProducts, listCategories } from '@/lib/api/products';
import { deleteProductAction } from './actions';
import type { ApiPaginatedProducts } from '@/types';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ProductsPageProps {
  searchParams: Promise<{
    limit?: string;
    offset?: string;
    category?: string;
    sort?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
    search?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const limit = resolvedParams.limit ? Number(resolvedParams.limit) : 20;
  const offset = resolvedParams.offset ? Number(resolvedParams.offset) : 0;
  const category = resolvedParams.category;
  const sort = resolvedParams.sort;
  const search = resolvedParams.search?.toLowerCase();

  let productsData: ApiPaginatedProducts = {
    count: 0,
    next: null,
    previous: null,
    results: [],
  };
  let categories: Array<{ id: string; name: string; slug: string }> = [];
  let fetchError: string | null = null;

  try {
    const [pData, cats] = await Promise.all([
      listProducts({ limit, offset, category, sort }),
      listCategories(),
    ]);
    productsData = pData;
    categories = cats;
  } catch (err) {
    fetchError = err instanceof Error ? err.message : 'Ürünler yüklenirken bir sorun oluştu.';
  }

  const displayedProducts = search
    ? productsData.results.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.slug.toLowerCase().includes(search),
    )
    : productsData.results;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Ürün Yönetimi"
          description="Mağazadaki tüm protein tozu, amino asit, vitamin ve gıda takviyesi ürünlerinin listesi"
        />
        <Button asChild size="sm" className="gap-1.5 shrink-0 self-start sm:self-auto">
          <Link href="/products/new">
            <Plus className="h-4 w-4" />
            <span>Yeni Ürün Ekle</span>
          </Link>
        </Button>
      </div>

      {fetchError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {fetchError}
        </div>
      )}

      <ProductsToolbar
        search={resolvedParams.search}
        category={category}
        sort={sort}
        categories={categories}
      />

      <ProductTable
        products={displayedProducts}
        onDelete={async (id) => {
          'use server';
          await deleteProductAction(id);
        }}
      />

      <ProductsPagination
        total={productsData.count}
        offset={offset}
        limit={limit}
        category={category}
        sort={sort}
        search={resolvedParams.search}
      />
    </div>
  );
}
