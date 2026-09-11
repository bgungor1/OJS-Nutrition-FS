import { serverFetch } from '../api-client';
import type { ContactPayload, ContactResponse } from '@/types';

export async function submitContact(payload: ContactPayload): Promise<ContactResponse> {
  return serverFetch<ContactResponse>('/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
