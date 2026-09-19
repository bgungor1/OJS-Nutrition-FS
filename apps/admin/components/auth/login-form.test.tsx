import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@/test/test-utils';
import { LoginForm } from './login-form';
import * as actions from '@/app/(auth)/login/actions';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'redirect' ? '/orders' : null),
  }),
}));

vi.mock('@/app/(auth)/login/actions', () => ({
  adminLoginAction: vi.fn(),
}));

describe('components/auth/login-form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all required form inputs and submit button', () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/yönetici e-postası/i);
    const passwordInput = screen.getByLabelText(/şifre/i);
    const submitButton = screen.getByRole('button', { name: /panele giriş yap/i });

    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');

    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('required');

    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
  });

  it('includes the hidden redirect input with value from searchParams', () => {
    const { container } = render(<LoginForm />);
    const hiddenRedirect = container.querySelector('input[name="redirect"]') as HTMLInputElement;
    expect(hiddenRedirect).toHaveValue('/orders');
  });

  it('allows user to type into email and password inputs', async () => {
    const { user } = render(<LoginForm />);

    const emailInput = screen.getByLabelText(/yönetici e-postası/i);
    const passwordInput = screen.getByLabelText(/şifre/i);

    await user.type(emailInput, 'admin@ojsnutrition.com');
    await user.type(passwordInput, 'adminPass123!');

    expect(emailInput).toHaveValue('admin@ojsnutrition.com');
    expect(passwordInput).toHaveValue('adminPass123!');
  });

  it('displays field validation errors and sets aria-invalid when action returns fieldErrors', async () => {
    vi.mocked(actions.adminLoginAction).mockResolvedValueOnce({
      success: false,
      error: 'Lütfen formu eksiksiz ve doğru doldurunuz.',
      fieldErrors: {
        email: 'Geçerli bir e-posta adresi giriniz',
        password: 'Şifre en az 6 karakter olmalıdır',
      },
    });

    const { user, container } = render(<LoginForm />);
    const emailInput = screen.getByLabelText(/yönetici e-postası/i);
    const passwordInput = screen.getByLabelText(/şifre/i);
    const form = container.querySelector('form')!;

    await user.type(emailInput, 'invalid-email');
    await user.type(passwordInput, '123');

    await act(async () => {
      form.requestSubmit();
    });

    expect(await screen.findByText('Geçerli bir e-posta adresi giriniz')).toBeInTheDocument();
    expect(screen.getByText('Şifre en az 6 karakter olmalıdır')).toBeInTheDocument();
    expect(screen.getByText('Lütfen formu eksiksiz ve doğru doldurunuz.')).toBeInTheDocument();

    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('displays server error banner when action returns an error message', async () => {
    vi.mocked(actions.adminLoginAction).mockResolvedValueOnce({
      success: false,
      error: 'E-posta veya şifre hatalı.',
    });

    const { user, container } = render(<LoginForm />);
    const form = container.querySelector('form')!;

    await user.type(screen.getByLabelText(/yönetici e-postası/i), 'wrong@domain.com');
    await user.type(screen.getByLabelText(/şifre/i), 'WrongPass123!');

    await act(async () => {
      form.requestSubmit();
    });

    expect(await screen.findByRole('alert')).toHaveTextContent('E-posta veya şifre hatalı.');
  });
});
