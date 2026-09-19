import * as React from 'react';
import { UsersTableRow } from './users-table-row';
import { UsersTableEmpty } from './users-table-empty';
import type { AdminUserListItem, Role } from '@/types';

interface UsersTableProps {
  users: AdminUserListItem[];
  currentUserId: string;
  onUpdateRole: (userId: string, role: Role) => Promise<void>;
}

export function UsersTable({ users, currentUserId, onUpdateRole }: UsersTableProps) {
  if (users.length === 0) {
    return <UsersTableEmpty />;
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kullanıcı</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">
                Rol
              </th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground hidden md:table-cell">
                Sipariş
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">
                Kayıt Tarihi
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UsersTableRow
                key={user.id}
                user={user}
                currentUserId={currentUserId}
                onUpdateRole={onUpdateRole}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
