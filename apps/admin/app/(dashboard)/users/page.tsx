import * as React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { UsersTable, UsersToolbar, UsersPagination } from '@/components/users';
import { listUsers } from '@/lib/api/users';
import { getAccessToken } from '@/lib/auth-cookies';
import { decodeJwtPayload } from '@/lib/jwt';
import { updateUserRoleAction } from './actions';
import type { AdminUsersPaginatedResponse } from '@/lib/api/users';
import type { Role } from '@/types';

export const dynamic = 'force-dynamic';

interface UsersPageProps {
  searchParams: Promise<{
    limit?: string;
    offset?: string;
    role?: string;
    search?: string;
  }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const resolvedParams = await searchParams;
  const limit = resolvedParams.limit ? Number(resolvedParams.limit) : 20;
  const offset = resolvedParams.offset ? Number(resolvedParams.offset) : 0;
  const role = resolvedParams.role as Role | undefined;
  const search = resolvedParams.search;

  const token = await getAccessToken();
  const payload = token ? decodeJwtPayload(token) : null;
  const currentUserId = payload?.sub ?? '';

  let usersData: AdminUsersPaginatedResponse = { count: 0, limit, offset, results: [] };
  let fetchError: string | null = null;

  try {
    usersData = await listUsers({ limit, offset, role, search });
  } catch (err) {
    fetchError = err instanceof Error ? err.message : 'Kullanıcılar yüklenirken bir sorun oluştu.';
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kullanıcı Yönetimi"
        description="Kayıtlı kullanıcıları görüntüleyin, sipariş geçmişlerini inceleyin ve sistem rollerini yönetin."
      />

      {fetchError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {fetchError}
        </div>
      )}

      <UsersToolbar search={search} role={role ?? 'all'} />

      <UsersTable
        users={usersData.results}
        currentUserId={currentUserId}
        onUpdateRole={async (userId, newRole) => {
          'use server';
          await updateUserRoleAction(userId, newRole);
        }}
      />

      <UsersPagination
        total={usersData.count}
        offset={offset}
        limit={limit}
        role={role}
        search={search}
      />
    </div>
  );
}
