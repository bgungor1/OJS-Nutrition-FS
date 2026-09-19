import { serverFetch } from '@/lib/api-client';
import type {
  CreateFaqDto,
  FaqItem,
  FaqQuery,
  UpdateFaqDto,
} from '@/types';

export async function listFaqs(query: FaqQuery = {}): Promise<FaqItem[]> {
  const params = new URLSearchParams();
  if (query.category) params.set('category', query.category);

  const queryString = params.toString();
  const endpoint = queryString ? `/faq?${queryString}` : '/faq';
  return serverFetch<FaqItem[]>(endpoint);
}

export async function getFaqById(id: string): Promise<FaqItem> {
  return serverFetch<FaqItem>(`/faq/${id}`);
}

export async function createFaq(dto: CreateFaqDto): Promise<FaqItem> {
  return serverFetch<FaqItem>('/faq', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function updateFaq(
  id: string,
  dto: UpdateFaqDto,
): Promise<FaqItem> {
  return serverFetch<FaqItem>(`/faq/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
}

export async function deleteFaq(id: string): Promise<{ id: string }> {
  return serverFetch<{ id: string }>(`/faq/${id}`, {
    method: 'DELETE',
  });
}
