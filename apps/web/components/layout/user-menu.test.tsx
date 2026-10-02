import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { UserMenu } from './user-menu';
import * as authActions from '@/lib/actions/auth';
import type { AccountProfile } from '@/types';

vi.mock('@/lib/actions/auth', () => ({
  logoutAction: vi.fn(),
}));

const mockUser: AccountProfile = {
  id: 'usr-1',
  email: 'test@example.com',
  first_name: 'Ahmet',
  last_name: 'Yılmaz',
  phone_number: '05551234567',
  role: 'customer',
};

describe('UserMenu Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login link button when user is not logged in', () => {
    render(<UserMenu user={null} />);

    const loginLink = screen.getByRole('link', { name: /giriş yap/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('renders user menu button when user is logged in', () => {
    render(<UserMenu user={mockUser} />);

    const menuButton = screen.getByRole('button', { name: /kullanıcı menüsü/i });
    expect(menuButton).toBeInTheDocument();
  });

  it('shows dropdown menu items including Çıkış Yap when user menu is opened', async () => {
    const { user } = render(<UserMenu user={mockUser} />);

    const menuButton = screen.getByRole('button', { name: /kullanıcı menüsü/i });
    await user.click(menuButton);

    expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /hesabım/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /siparişlerim/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /kayıtlı adreslerim/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /çıkış yap/i })).toBeInTheDocument();
  });

  it('calls logoutAction when Çıkış Yap item is selected', async () => {
    const { user } = render(<UserMenu user={mockUser} />);

    const menuButton = screen.getByRole('button', { name: /kullanıcı menüsü/i });
    await user.click(menuButton);

    const logoutItem = screen.getByRole('menuitem', { name: /çıkış yap/i });
    await user.click(logoutItem);

    expect(authActions.logoutAction).toHaveBeenCalledTimes(1);
  });
});
