import * as React from 'react';
import type { Role } from '@/types';

interface UserRoleBadgeProps {
  role: Role;
  className?: string;
}

const ROLE_CONFIG: Record<Role, { label: string; className: string }> = {
  admin: {
    label: 'Yönetici',
    className:
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  },
  customer: {
    label: 'Müşteri',
    className:
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
  },
};

export function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.customer;
  return (
    <span className={[config.className, className].filter(Boolean).join(' ')}>
      {config.label}
    </span>
  );
}
