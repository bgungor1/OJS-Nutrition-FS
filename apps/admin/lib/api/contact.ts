import { serverFetch } from '@/lib/api-client';
import type {
  ContactListResponse,
  ContactMessage,
  ContactQuery,
  UpdateContactDto,
} from '@/types';

export async function listContacts(
  query: ContactQuery = {},
): Promise<ContactListResponse> {
  const params = new URLSearchParams();
  if (query.handled !== undefined) params.set('handled', String(query.handled));
  if (query.limit !== undefined) params.set('limit', String(query.limit));
  if (query.offset !== undefined) params.set('offset', String(query.offset));

  const queryString = params.toString();
  const endpoint = queryString ? `/contact?${queryString}` : '/contact';
  return serverFetch<ContactListResponse>(endpoint);
}

export async function getContactById(id: string): Promise<ContactMessage> {
  return serverFetch<ContactMessage>(`/contact/${id}`);
}

export async function updateContactStatus(
  id: string,
  dto: UpdateContactDto,
): Promise<ContactMessage> {
  return serverFetch<ContactMessage>(`/contact/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
}

export async function deleteContact(id: string): Promise<{ id: string }> {
  return serverFetch<{ id: string }>(`/contact/${id}`, {
    method: 'DELETE',
  });
}
