import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { AdminSidebar } from './admin-sidebar';

vi.mock('next/navigation', () => ({
  usePathname: () => '/products',
}));

vi.mock('@/lib/actions/auth', () => ({
  adminLogoutAction: vi.fn(),
}));

describe('components/layout/admin-sidebar', () => {
  it('renders all administrative navigation items', () => {
    render(<AdminSidebar />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Ürünler')).toBeInTheDocument();
    expect(screen.getByText('Siparişler')).toBeInTheDocument();
    expect(screen.getByText('Kullanıcılar')).toBeInTheDocument();
    expect(screen.getByText('SSS Yönetimi')).toBeInTheDocument();
    expect(screen.getByText('İletişim')).toBeInTheDocument();
  });

  it('highlights the active navigation link based on current pathname', () => {
    render(<AdminSidebar />);

    const productsLink = screen.getByRole('link', { name: /ürünler/i });
    expect(productsLink).toHaveClass('bg-primary');
  });

  it('renders the external storefront link', () => {
    render(<AdminSidebar />);

    const storefrontLink = screen.getByRole('link', { name: /müşteri mağazası/i });
    expect(storefrontLink).toHaveAttribute('target', '_blank');
    expect(storefrontLink).toHaveAttribute('href', 'http://localhost:3001');
  });

  it('renders logout button', () => {
    render(<AdminSidebar />);

    expect(screen.getByRole('button', { name: /oturumu kapat/i })).toBeInTheDocument();
  });
});
