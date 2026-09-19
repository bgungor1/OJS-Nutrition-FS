import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UsersTable } from './users-table';
import type { AdminUserListItem } from '@/types';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

describe('UsersTable', () => {
  const mockOnUpdateRole = vi.fn();

  it('renders empty state when user list is empty', () => {
    render(
      <UsersTable users={[]} currentUserId="current-admin" onUpdateRole={mockOnUpdateRole} />,
    );
    expect(screen.getByText('Kullanıcı Bulunamadı')).toBeInTheDocument();
  });

  it('renders user list when users are provided', () => {
    const mockUsers: AdminUserListItem[] = [
      {
        id: 'u-1',
        email: 'ali@example.com',
        firstName: 'Ali',
        lastName: 'Kaya',
        role: 'customer',
        authProvider: 'local',
        createdAt: '2026-09-01T10:00:00.000Z',
        orderCount: 7,
      },
    ];

    render(
      <UsersTable
        users={mockUsers}
        currentUserId="current-admin"
        onUpdateRole={mockOnUpdateRole}
      />,
    );

    expect(screen.getByText('Ali Kaya')).toBeInTheDocument();
    expect(screen.getByText('ali@example.com')).toBeInTheDocument();
    expect(screen.getByText('Müşteri')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('renders dash for users with no name', () => {
    const mockUsers: AdminUserListItem[] = [
      {
        id: 'u-2',
        email: 'noname@example.com',
        firstName: null,
        lastName: null,
        role: 'admin',
        authProvider: 'google',
        createdAt: '2026-09-01T10:00:00.000Z',
        orderCount: 0,
      },
    ];

    render(
      <UsersTable
        users={mockUsers}
        currentUserId="current-admin"
        onUpdateRole={mockOnUpdateRole}
      />,
    );

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('Yönetici')).toBeInTheDocument();
  });
});
