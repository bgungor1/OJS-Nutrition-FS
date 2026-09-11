import { serverFetch } from '../api-client';
import type {
  ApiBestSellerProduct,
  ApiProduct,
  ApiProductDetail,
  GetProductsParams,
  PaginatedResponse,
} from '@/types';

export async function getBestSellers(): Promise<ApiBestSellerProduct[]> {
  return serverFetch<ApiBestSellerProduct[]>('/products/best-sellers', {
    next: { revalidate: 60, tags: ['best-sellers'] },
  });
}

export async function getProducts(
  params: GetProductsParams = {},
): Promise<PaginatedResponse<ApiProduct>> {
  const searchParams = new URLSearchParams();

  if (params.limit !== undefined) {
    searchParams.set('limit', params.limit.toString());
  }
  if (params.offset !== undefined) {
    searchParams.set('offset', params.offset.toString());
  }
  if (params.category) {
    searchParams.set('category', params.category);
  }
  if (params.sort) {
    searchParams.set('sort', params.sort);
  }

  const query = searchParams.toString();
  const endpoint = query ? `/products?${query}` : '/products';

  return serverFetch<PaginatedResponse<ApiProduct>>(endpoint, {
    next: { revalidate: 60, tags: ['products'] },
  });
}

export async function getProductBySlug(slug: string): Promise<ApiProductDetail> {
  return serverFetch<ApiProductDetail>(`/products/${encodeURIComponent(slug)}`, {
    next: { revalidate: 60, tags: [`product-${slug}`] },
  });
}
