'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { UserRoleBadge } from './user-role-badge';
import { UserRoleDialog } from './user-role-dialog';
import type { AdminUserDetail, Role } from '@/types';

interface UserDetailHeaderProps {
  user: AdminUserDetail;
  currentUserId: string;
  onUpdateRole: (userId: string, role: Role) => Promise<void>;
}

export function UserDetailHeader({ user, currentUserId, onUpdateRole }: UserDetailHeaderProps) {
  const displayName =
    user.firstName || user.lastName
      ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
      : user.email;

  const joinedDate = new Date(user.createdAt).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-4">
      <Link
        href="/users"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kullanıcı Listesine Dön
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border bg-card p-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">{displayName}</h1>
            <UserRoleBadge role={user.role} />
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground">
            Kayıt: {joinedDate} · {user.authProvider === 'google' ? 'Google ile' : 'E-posta ile'} kaydoldu
          </p>
        </div>

        <UserRoleDialog
          userId={user.id}
          currentUserId={currentUserId}
          userName={displayName}
          initialRole={user.role}
          onUpdate={onUpdateRole}
        />
      </div>
    </div>
  );
}
