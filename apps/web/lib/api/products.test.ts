import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProducts, getBestSellers, getProductBySlug } from './products';
import { serverFetch } from '../api-client';

vi.mock('../api-client', () => ({
  serverFetch: vi.fn(),
}));

describe('Products API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProducts', () => {
    it('calls /products with default empty query', async () => {
      vi.mocked(serverFetch).mockResolvedValue({
        count: 0,
        next: null,
        previous: null,
        results: [],
      });

      const result = await getProducts();

      expect(serverFetch).toHaveBeenCalledWith('/products', {
        next: { revalidate: 60, tags: ['products'] },
      });
      expect(result.count).toBe(0);
    });

    it('builds query string correctly with limit, offset, category, sort and search', async () => {
      vi.mocked(serverFetch).mockResolvedValue({
        count: 1,
        next: null,
        previous: null,
        results: [],
      });

      await getProducts({
        limit: 12,
        offset: 24,
        category: 'protein',
        sort: 'price_asc',
        search: 'whey isolate',
      });

      expect(serverFetch).toHaveBeenCalledWith(
        '/products?limit=12&offset=24&category=protein&sort=price_asc&search=whey+isolate',
        { next: { revalidate: 60, tags: ['products'] } },
      );
    });
  });

  describe('getBestSellers', () => {
    it('calls /products/best-sellers', async () => {
      vi.mocked(serverFetch).mockResolvedValue([]);

      const result = await getBestSellers();

      expect(serverFetch).toHaveBeenCalledWith('/products/best-sellers', {
        next: { revalidate: 60, tags: ['best-sellers'] },
      });
      expect(result).toEqual([]);
    });
  });

  describe('getProductBySlug', () => {
    it('calls /products/:slug with encoded slug', async () => {
      vi.mocked(serverFetch).mockResolvedValue({ id: '1', slug: 'whey-protein', name: 'Whey' });

      const result = await getProductBySlug('whey-protein');

      expect(serverFetch).toHaveBeenCalledWith('/products/whey-protein', {
        next: { revalidate: 60, tags: ['product-whey-protein'] },
      });
      expect(result.name).toBe('Whey');
    });
  });
});
