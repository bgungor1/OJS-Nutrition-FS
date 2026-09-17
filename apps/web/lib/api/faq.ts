import { serverFetch } from '../api-client';
import type { ApiFaqItem } from '@/types';

export async function getFaqItems(category?: string): Promise<ApiFaqItem[]> {
  const endpoint = category
    ? `/faq?category=${encodeURIComponent(category)}`
    : '/faq';

  return serverFetch<ApiFaqItem[]>(endpoint, {
    next: { revalidate: 3600, tags: ['faq'] },
  });
}
