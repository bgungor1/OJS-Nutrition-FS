import { serverFetch } from '@/lib/api-client';
import type {
  ApiPaginatedProducts,
  ApiProductDetail,
  CategoryTree,
  CreateProductInput,
  UpdateProductInput,
  CreateVariantInput,
  UpdateVariantInput,
  ProductsQuery,
  MediaUploadResponse,
} from '@/types';

export async function listProducts(
  query: ProductsQuery = {},
): Promise<ApiPaginatedProducts> {
  const params = new URLSearchParams();
  if (query.limit !== undefined) params.set('limit', String(query.limit));
  if (query.offset !== undefined) params.set('offset', String(query.offset));
  if (query.category) params.set('category', query.category);
  if (query.sort) params.set('sort', query.sort);

  const queryString = params.toString();
  const endpoint = queryString ? `/products?${queryString}` : '/products';
  return serverFetch<ApiPaginatedProducts>(endpoint);
}

export async function getProductBySlug(
  slug: string,
): Promise<ApiProductDetail> {
  return serverFetch<ApiProductDetail>(`/products/${slug}`);
}

export async function createProduct(
  dto: CreateProductInput,
): Promise<ApiProductDetail> {
  return serverFetch<ApiProductDetail>('/products', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function updateProduct(
  id: string,
  dto: UpdateProductInput,
): Promise<ApiProductDetail> {
  return serverFetch<ApiProductDetail>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  return serverFetch<void>(`/products/${id}`, {
    method: 'DELETE',
  });
}

export async function createVariant(
  productId: string,
  dto: CreateVariantInput,
): Promise<ApiProductDetail> {
  return serverFetch<ApiProductDetail>(`/products/${productId}/variants`, {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function updateVariant(
  productId: string,
  variantId: string,
  dto: UpdateVariantInput,
): Promise<ApiProductDetail> {
  return serverFetch<ApiProductDetail>(
    `/products/${productId}/variants/${variantId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(dto),
    },
  );
}

export async function deleteVariant(
  productId: string,
  variantId: string,
): Promise<void> {
  return serverFetch<void>(`/products/${productId}/variants/${variantId}`, {
    method: 'DELETE',
  });
}

export async function listCategories(): Promise<CategoryTree[]> {
  return serverFetch<CategoryTree[]>('/categories');
}

export async function uploadProductMedia(
  formData: FormData,
): Promise<MediaUploadResponse> {
  return serverFetch<MediaUploadResponse>('/media/upload', {
    method: 'POST',
    body: formData,
  });
}
