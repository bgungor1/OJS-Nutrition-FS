import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { AuthCard } from './auth-card';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  redirect: vi.fn(),
}));

describe('AuthCard component', () => {
  it('renders card header title and description', () => {
    render(<AuthCard />);

    expect(screen.getByText('OJS Nutrition')).toBeInTheDocument();
    expect(screen.getByText(/hesabınıza giriş yapın veya yeni bir hesap oluşturun/i)).toBeInTheDocument();
  });

  it('renders login and register tab triggers', () => {
    render(<AuthCard />);

    expect(screen.getByRole('tab', { name: /giriş yap/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /kayıt ol/i })).toBeInTheDocument();
  });

  it('renders login form by default and shows email input', () => {
    render(<AuthCard defaultTab="login" />);

    expect(screen.getByLabelText(/e-posta adresi/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /giriş yap/i })).toBeInTheDocument();
  });

  it('renders register form when defaultTab is set to register', () => {
    render(<AuthCard defaultTab="register" />);

    expect(screen.getByLabelText(/^ad$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^soyad$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kayıt ol/i })).toBeInTheDocument();
  });

  it('switches to register tab content when register tab is clicked', async () => {
    const { user } = render(<AuthCard defaultTab="login" />);

    const registerTab = screen.getByRole('tab', { name: /kayıt ol/i });
    await user.click(registerTab);

    expect(screen.getByLabelText(/^ad$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^soyad$/i)).toBeInTheDocument();
  });

  it('renders Google sign-in link with valid OAuth endpoint', () => {
    render(<AuthCard />);

    const googleLink = screen.getByRole('link', { name: /google ile devam et/i });
    expect(googleLink).toBeInTheDocument();
    expect(googleLink).toHaveAttribute('href', expect.stringContaining('/auth/google'));
  });
});
