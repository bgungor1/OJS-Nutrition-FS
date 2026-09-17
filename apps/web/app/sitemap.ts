import type { MetadataRoute } from 'next';
import { getProducts, getCategories } from '@/lib/api';

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: 'daily' | 'weekly' | 'monthly';
  priority: number;
}> = [
    { path: '', changeFrequency: 'daily', priority: 1.0 },
    { path: '/products', changeFrequency: 'daily', priority: 0.9 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/faq', changeFrequency: 'weekly', priority: 0.7 },
  ];

const FALLBACK_CATEGORIES = [
  'protein',
  'spor-gidalari',
  'vitamin',
  'saglik',
  'gida',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';
  const cleanSiteUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${cleanSiteUrl}${route.path || '/'}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  let categorySlugs = FALLBACK_CATEGORIES;
  try {
    const categories = await getCategories();
    if (categories && categories.length > 0) {
      categorySlugs = categories.map((c) => c.slug);
    }
  } catch (error) {
    console.warn('Sitemap kategorileri API üzerinden alınamadı, yerel liste kullanılacak:', error);
  }

  const categoryEntries: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${cleanSiteUrl}/products/${slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const productsData = await getProducts({ limit: 100 });
    if (productsData && productsData.results && productsData.results.length > 0) {
      productEntries = productsData.results.map((product) => ({
        url: `${cleanSiteUrl}/product/${product.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.warn('Sitemap ürün listesi API üzerinden alınamadı:', error);
  }

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
