import { describe, it, expect, vi, beforeEach } from 'vitest';
import robots from './robots';
import sitemap from './sitemap';
import * as api from '@/lib/api';

vi.mock('@/lib/api', () => ({
  getCategories: vi.fn(),
  getProducts: vi.fn(),
}));

describe('SEO - robots.ts & sitemap.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('robots()', () => {
    it('returns crawling rules with disallows for sensitive routes and valid sitemap reference', () => {
      const result = robots();

      expect(result.rules).toBeDefined();
      const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules;

      expect(rules.userAgent).toBe('*');
      expect(rules.allow).toBe('/');
      expect(rules.disallow).toEqual(
        expect.arrayContaining(['/account/', '/payment/', '/api/', '/auth/'])
      );
      expect(result.sitemap).toMatch(/\/sitemap\.xml$/);
    });
  });

  describe('sitemap()', () => {
    it('returns valid sitemap entries for static, category and product pages', async () => {
      vi.mocked(api.getCategories).mockResolvedValue([
        { id: 'cat_1', name: 'Protein', slug: 'protein', subCategories: [] },
        { id: 'cat_2', name: 'Vitamin', slug: 'vitamin', subCategories: [] },
      ]);

      vi.mocked(api.getProducts).mockResolvedValue({
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 'prod_1',
            name: 'Whey Protein',
            short_explanation: 'Saf protein',
            slug: 'whey-protein',
            price_info: {
              total_price: 899,
              discounted_price: null,
              discount_percentage: null,
              profit: null,
              price_per_servings: null,
            },
            photo_src: 'media/products/whey.jpg',
            comment_count: 5,
            average_star: 4.8,
          },
        ],
      });

      const entries = await sitemap();

      expect(entries.length).toBeGreaterThanOrEqual(8);

      const urls = entries.map((e) => e.url);

      expect(urls.some((u) => u.endsWith('/'))).toBe(true);
      expect(urls.some((u) => u.endsWith('/products'))).toBe(true);
      expect(urls.some((u) => u.endsWith('/about'))).toBe(true);
      expect(urls.some((u) => u.endsWith('/contact'))).toBe(true);
      expect(urls.some((u) => u.endsWith('/faq'))).toBe(true);
      expect(urls.some((u) => u.endsWith('/products/protein'))).toBe(true);
      expect(urls.some((u) => u.endsWith('/products/vitamin'))).toBe(true);
      expect(urls.some((u) => u.endsWith('/product/whey-protein'))).toBe(true);

      for (const entry of entries) {
        expect(entry.url).toMatch(/^http/);
        expect(entry.lastModified).toBeInstanceOf(Date);
        expect(['daily', 'weekly', 'monthly']).toContain(entry.changeFrequency);
        expect(typeof entry.priority).toBe('number');
      }
    });

    it('falls back gracefully to default categories and empty products if APIs fail', async () => {
      vi.mocked(api.getCategories).mockRejectedValue(new Error('Network error'));
      vi.mocked(api.getProducts).mockRejectedValue(new Error('API offline'));

      const entries = await sitemap();

      expect(entries.length).toBeGreaterThanOrEqual(5);
      const urls = entries.map((e) => e.url);

      expect(urls.some((u) => u.endsWith('/products/protein'))).toBe(true);
      expect(urls.some((u) => u.endsWith('/products/vitamin'))).toBe(true);
    });
  });
});
