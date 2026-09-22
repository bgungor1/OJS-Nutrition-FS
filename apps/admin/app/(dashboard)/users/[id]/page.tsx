import * as React from 'react';
import { notFound } from 'next/navigation';
import {
  UserDetailHeader,
  UserDetailStats,
  UserDetailOrders,
  UserDetailAddresses,
} from '@/components/users';
import { getUserById } from '@/lib/api/users';
import { ApiError } from '@/lib/api-client';
import { getAccessToken } from '@/lib/auth-cookies';
import { decodeJwtPayload } from '@/lib/jwt';
import { updateUserRoleAction } from '../actions';
import type { AdminUserDetail } from '@/types';

export const dynamic = 'force-dynamic';

interface UserDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;

  const token = await getAccessToken();
  const payload = token ? decodeJwtPayload(token) : null;
  const currentUserId = payload?.sub ?? '';

  let user: AdminUserDetail | null = null;
  try {
    user = await getUserById(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <UserDetailHeader
        user={user}
        currentUserId={currentUserId}
        onUpdateRole={async (userId, role) => {
          'use server';
          await updateUserRoleAction(userId, role);
        }}
      />

      <UserDetailStats user={user} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <UserDetailOrders orders={user.orders} />
        <UserDetailAddresses addresses={user.addresses} />
      </div>
    </div>
  );
}
