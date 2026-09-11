import { serverFetch } from '../api-client';
import type { ApiCategory } from '@/types';

export async function getCategories(): Promise<ApiCategory[]> {
  return serverFetch<ApiCategory[]>('/categories', {
    next: { revalidate: 3600, tags: ['categories'] },
  });
}
