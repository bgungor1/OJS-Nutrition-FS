import * as React from 'react';
import Link from 'next/link';
import { UserRoleBadge } from './user-role-badge';
import { UserRoleDialog } from './user-role-dialog';
import type { AdminUserListItem, Role } from '@/types';

interface UsersTableRowProps {
  user: AdminUserListItem;
  currentUserId: string;
  onUpdateRole: (userId: string, role: Role) => Promise<void>;
}

export function UsersTableRow({ user, currentUserId, onUpdateRole }: UsersTableRowProps) {
  const displayName =
    user.firstName || user.lastName
      ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
      : '—';

  const joinedDate = new Date(user.createdAt).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <tr className="border-b transition-colors hover:bg-muted/50">
      <td className="px-4 py-3">
        <Link
          href={`/users/${user.id}`}
          className="font-medium text-sm hover:underline hover:text-primary"
        >
          {displayName}
        </Link>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
        <UserRoleBadge role={user.role} />
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell text-center">
        {user.orderCount}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
        {joinedDate}
      </td>
      <td className="px-4 py-3 text-right">
        <UserRoleDialog
          userId={user.id}
          currentUserId={currentUserId}
          userName={displayName !== '—' ? displayName : user.email}
          initialRole={user.role}
          onUpdate={onUpdateRole}
        />
      </td>
    </tr>
  );
}
