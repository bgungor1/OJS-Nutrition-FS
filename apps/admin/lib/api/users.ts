import { serverFetch } from '@/lib/api-client';
import type {
  AdminUserDetail,
  AdminUsersQuery,
  UpdateUserRoleDto,
} from '@/types';

export interface AdminUsersPaginatedResponse {
  count: number;
  limit: number;
  offset: number;
  results: import('@/types').AdminUserListItem[];
}

export async function listUsers(
  query: AdminUsersQuery = {},
): Promise<AdminUsersPaginatedResponse> {
  const params = new URLSearchParams();
  if (query.limit !== undefined) params.set('limit', String(query.limit));
  if (query.offset !== undefined) params.set('offset', String(query.offset));
  if (query.role) params.set('role', query.role);
  if (query.search) params.set('search', query.search);

  const queryString = params.toString();
  const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';
  return serverFetch<AdminUsersPaginatedResponse>(endpoint);
}

export async function getUserById(id: string): Promise<AdminUserDetail> {
  return serverFetch<AdminUserDetail>(`/admin/users/${id}`);
}

export async function updateUserRole(
  id: string,
  dto: UpdateUserRoleDto,
): Promise<AdminUserDetail> {
  return serverFetch<AdminUserDetail>(`/admin/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}
