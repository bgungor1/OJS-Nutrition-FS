import { serverFetch } from '../api-client';
import type { AccountProfile, UpdateProfileRequest } from '@/types';
export async function getMyAccount(token: string): Promise<AccountProfile> {
  return serverFetch<AccountProfile>('/users/my-account', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
}

export async function updateMyAccount(
  token: string,
  dto: UpdateProfileRequest,
): Promise<AccountProfile> {
  return serverFetch<AccountProfile>('/users/my-account', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dto),
    cache: 'no-store',
  });
}
