import type { Metadata } from 'next';
import {
  CatalogHeader,
  CatalogSort,
  ProductGrid,
  CatalogPagination,
} from '@/components/catalog';
import { getProducts } from '@/lib/api';
import type { ApiProduct, PaginatedResponse, ProductSortOption } from '@/types';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Tüm Ürünler | OJS Nutrition',
  description:
    'En kaliteli sporcu besinleri, protein tozları, amino asitler ve vitamin takviyeleri. Türkiye genelinde aynı gün ücretsiz kargo.',
};

type ProductsPageProps = {
  searchParams: Promise<{
    page?: string;
    category?: string;
    sort?: ProductSortOption;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { page, category, sort } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || '1', 10));
  const limit = 12;
  const offset = (currentPage - 1) * limit;

  let data: PaginatedResponse<ApiProduct> = {
    count: 0,
    next: null,
    previous: null,
    results: [],
  };

  try {
    data = await getProducts({
      limit,
      offset,
      category,
      sort,
    });
  } catch (error) {
    console.warn('Ürün listesi API üzerinden alınamadı:', error);
  }

  const totalPages = Math.ceil(data.count / limit);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <CatalogHeader
        title="Tüm Ürünler"
        description="Vücudunuzun ihtiyacı olan yüksek kaliteli protein, amino asit ve performans artırıcı sporcu besinleri."
        totalCount={data.count}
      />

      <div className="flex justify-end mb-6">
        <CatalogSort />
      </div>

      <ProductGrid products={data.results} />

      <CatalogPagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl="/products"
        query={{ category, sort }}
      />
    </div>
  );
}
