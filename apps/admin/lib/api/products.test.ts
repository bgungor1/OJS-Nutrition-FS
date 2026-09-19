import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as productsApi from './products';
import * as apiClient from '@/lib/api-client';

vi.mock('@/lib/api-client', () => ({
  serverFetch: vi.fn(),
}));

describe('lib/api/products', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls listProducts with query parameters', async () => {
    vi.mocked(apiClient.serverFetch).mockResolvedValueOnce({
      count: 1,
      next: null,
      previous: null,
      results: [],
    });

    await productsApi.listProducts({ limit: 10, offset: 20, category: 'protein', sort: 'price_asc' });

    expect(apiClient.serverFetch).toHaveBeenCalledWith(
      '/products?limit=10&offset=20&category=protein&sort=price_asc',
    );
  });

  it('calls getProductBySlug with product slug', async () => {
    vi.mocked(apiClient.serverFetch).mockResolvedValueOnce({ id: 'prod-1', name: 'Whey' });

    await productsApi.getProductBySlug('whey-protein');

    expect(apiClient.serverFetch).toHaveBeenCalledWith('/products/whey-protein');
  });

  it('calls createProduct with POST and request body', async () => {
    const input = {
      name: 'Creatine',
      slug: 'creatine',
      shortExplanation: 'Short explanation',
      usage: 'Usage text',
      features: 'Features text',
      description: 'Long description',
      tags: ['CREATINE'],
      mainCategoryId: 'cat-1',
      subCategoryId: 'sub-1',
    };

    vi.mocked(apiClient.serverFetch).mockResolvedValueOnce({ id: 'prod-2', ...input });

    await productsApi.createProduct(input);

    expect(apiClient.serverFetch).toHaveBeenCalledWith('/products', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  });

  it('calls updateProduct with PUT and productId', async () => {
    const updateInput = { name: 'Updated Whey' };
    vi.mocked(apiClient.serverFetch).mockResolvedValueOnce({ id: 'prod-1', name: 'Updated Whey' });

    await productsApi.updateProduct('prod-1', updateInput);

    expect(apiClient.serverFetch).toHaveBeenCalledWith('/products/prod-1', {
      method: 'PUT',
      body: JSON.stringify(updateInput),
    });
  });

  it('calls deleteProduct with DELETE method', async () => {
    vi.mocked(apiClient.serverFetch).mockResolvedValueOnce(undefined);

    await productsApi.deleteProduct('prod-1');

    expect(apiClient.serverFetch).toHaveBeenCalledWith('/products/prod-1', {
      method: 'DELETE',
    });
  });

  it('calls createVariant with POST and variant payload', async () => {
    const variantInput = {
      aroma: 'Banana',
      gram: 1000,
      pieces: 1,
      totalServings: 30,
      totalPrice: 500,
      pricePerServing: 16.6,
      photoSrc: 'media/banana.jpg',
    };

    vi.mocked(apiClient.serverFetch).mockResolvedValueOnce({ id: 'prod-1' });

    await productsApi.createVariant('prod-1', variantInput);

    expect(apiClient.serverFetch).toHaveBeenCalledWith('/products/prod-1/variants', {
      method: 'POST',
      body: JSON.stringify(variantInput),
    });
  });

  it('calls updateVariant with PATCH method and variantId', async () => {
    const patchInput = { totalPrice: 550 };
    vi.mocked(apiClient.serverFetch).mockResolvedValueOnce({ id: 'prod-1' });

    await productsApi.updateVariant('prod-1', 'var-1', patchInput);

    expect(apiClient.serverFetch).toHaveBeenCalledWith('/products/prod-1/variants/var-1', {
      method: 'PATCH',
      body: JSON.stringify(patchInput),
    });
  });

  it('calls deleteVariant with DELETE method', async () => {
    vi.mocked(apiClient.serverFetch).mockResolvedValueOnce(undefined);

    await productsApi.deleteVariant('prod-1', 'var-1');

    expect(apiClient.serverFetch).toHaveBeenCalledWith('/products/prod-1/variants/var-1', {
      method: 'DELETE',
    });
  });

  it('calls listCategories with GET /categories', async () => {
    vi.mocked(apiClient.serverFetch).mockResolvedValueOnce([]);

    await productsApi.listCategories();

    expect(apiClient.serverFetch).toHaveBeenCalledWith('/categories');
  });

  it('calls uploadProductMedia with FormData and POST method', async () => {
    const formData = new FormData();
    formData.append('file', new Blob(['fake']), 'test.jpg');

    vi.mocked(apiClient.serverFetch).mockResolvedValueOnce({
      photo_src: 'media/test.jpg',
      url: 'http://localhost/media/test.jpg',
      filename: 'test.jpg',
      size: 100,
      mimetype: 'image/jpeg',
    });

    await productsApi.uploadProductMedia(formData);

    expect(apiClient.serverFetch).toHaveBeenCalledWith('/media/upload', {
      method: 'POST',
      body: formData,
    });
  });
});
