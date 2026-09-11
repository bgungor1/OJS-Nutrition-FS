import type { Metadata } from 'next';
import { CatalogHeader } from '@/components/catalog/catalog-header';
import { CatalogSort } from '@/components/catalog/catalog-sort';
import { ProductGrid } from '@/components/catalog/product-grid';
import { CatalogPagination } from '@/components/catalog/catalog-pagination';
import { getProducts } from '@/lib/api/products';
import { getCategories } from '@/lib/api/categories';
import type { ApiProduct, PaginatedResponse, ProductSortOption } from '@/types';

export const revalidate = 60;

const CATEGORY_DESCRIPTIONS: Record<string, { title: string; description: string }> = {
  protein: {
    title: 'Protein Tozları',
    description: 'Kas gelişimini ve onarımını destekleyen en saf whey, izole ve kazein protein takviyeleri.',
  },
  'spor-gidalari': {
    title: 'Spor Gıdaları & Amino Asit',
    description: 'Antrenman performansını artıran kreatin, BCAA, pre-workout ve amino asit kombinasyonları.',
  },
  vitamin: {
    title: 'Vitamin & Mineraller',
    description: 'Günlük bağışıklık, enerji ve zindelik desteği için multivitaminler ve mineral takviyeleri.',
  },
  saglik: {
    title: 'Sağlık & Yaşam',
    description: 'Omega-3, kolajen ve eklem sağlığı takviyeleri ile vücudunuzu destekleyin.',
  },
  gida: {
    title: 'Gıda & Atıştırmalık',
    description: 'Yüksek proteinli fıstık ezmeleri, pirinç unları ve sağlıklı fonksiyonel atıştırmalıklar.',
  },
};

type CategoryPageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{
    page?: string;
    sort?: ProductSortOption;
  }>;
};

export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    if (categories.length > 0) {
      return categories.map((c) => ({ category: c.slug }));
    }
  } catch {
  }

  return [
    { category: 'protein' },
    { category: 'spor-gidalari' },
    { category: 'vitamin' },
    { category: 'saglik' },
    { category: 'gida' },
  ];
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const info = CATEGORY_DESCRIPTIONS[category];
  const title = info ? info.title : category.charAt(0).toUpperCase() + category.slice(1);

  return {
    title: `${title} | OJS Nutrition`,
    description:
      info?.description ||
      `OJS Nutrition ${title} kategorisindeki en kaliteli sporcu besinleri ve takviyeleri.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category } = await params;
  const { page, sort } = await searchParams;
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
    console.warn(`"${category}" kategorisi ürünleri API üzerinden alınamadı:`, error);
  }

  const info = CATEGORY_DESCRIPTIONS[category];
  const title = info ? info.title : category.charAt(0).toUpperCase() + category.slice(1);
  const description = info?.description;
  const totalPages = Math.ceil(data.count / limit);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <CatalogHeader
        title={title}
        description={description}
        categorySlug={category}
        totalCount={data.count}
      />

      <div className="flex justify-end mb-6">
        <CatalogSort />
      </div>

      <ProductGrid products={data.results} />

      <CatalogPagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl={`/products/${category}`}
        query={{ sort }}
      />
    </div>
  );
}
