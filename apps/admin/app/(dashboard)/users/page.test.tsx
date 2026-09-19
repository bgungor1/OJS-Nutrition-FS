import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UsersPage from './page';
import * as usersApi from '@/lib/api/users';

vi.mock('@/lib/api/users', () => ({
  listUsers: vi.fn(),
}));

vi.mock('@/lib/auth-cookies', () => ({
  getAccessToken: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/jwt', () => ({
  decodeJwtPayload: vi.fn().mockReturnValue(null),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/users',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('UsersPage', () => {
  it('renders user listing page with headers and table', async () => {
    vi.mocked(usersApi.listUsers).mockResolvedValueOnce({
      count: 1,
      limit: 20,
      offset: 0,
      results: [
        {
          id: 'u-101',
          email: 'ayse@example.com',
          firstName: 'Ayşe',
          lastName: 'Yılmaz',
          role: 'customer',
          authProvider: 'local',
          createdAt: '2026-09-01T10:00:00.000Z',
          orderCount: 3,
        },
      ],
    });

    const pageResult = await UsersPage({
      searchParams: Promise.resolve({}),
    });

    render(pageResult);

    expect(screen.getByText('Kullanıcı Yönetimi')).toBeInTheDocument();
    expect(screen.getByText('Ayşe Yılmaz')).toBeInTheDocument();
    expect(screen.getByText('ayse@example.com')).toBeInTheDocument();
    expect(screen.getAllByText('Müşteri').length).toBeGreaterThan(0);
  });

  it('renders error message when API fails', async () => {
    vi.mocked(usersApi.listUsers).mockRejectedValueOnce(
      new Error('Kullanıcılar yüklenemedi'),
    );

    const pageResult = await UsersPage({
      searchParams: Promise.resolve({}),
    });

    render(pageResult);

    expect(screen.getByText('Kullanıcılar yüklenemedi')).toBeInTheDocument();
  });
});
