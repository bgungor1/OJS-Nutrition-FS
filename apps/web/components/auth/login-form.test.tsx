import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@/test/test-utils';
import { LoginForm } from './login-form';
import * as actions from '@/app/(shop)/login/actions';

vi.mock('@/app/(shop)/login/actions', () => ({
  loginAction: vi.fn(),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all required form inputs and submit button', () => {
    render(<LoginForm redirectTo="/checkout" />);

    const emailInput = screen.getByLabelText(/e-posta adresi/i);
    const passwordInput = screen.getByLabelText(/şifre/i);
    const submitButton = screen.getByRole('button', { name: /giriş yap/i });

    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');

    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('required');

    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
  });

  it('includes the hidden redirect input with default or custom value', () => {
    const { container, rerender } = render(<LoginForm />);
    let hiddenRedirect = container.querySelector('input[name="redirect"]') as HTMLInputElement;
    expect(hiddenRedirect).toHaveValue('/account');

    rerender(<LoginForm redirectTo="/payment" />);
    hiddenRedirect = container.querySelector('input[name="redirect"]') as HTMLInputElement;
    expect(hiddenRedirect).toHaveValue('/payment');
  });

  it('allows user to type into email and password inputs', async () => {
    const { user } = render(<LoginForm />);

    const emailInput = screen.getByLabelText(/e-posta adresi/i);
    const passwordInput = screen.getByLabelText(/şifre/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Secret123!');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('Secret123!');
  });

  it('displays field validation errors and sets aria-invalid when action returns fieldErrors', async () => {
    vi.mocked(actions.loginAction).mockResolvedValueOnce({
      success: false,
      error: 'Lütfen bilgilerinizi kontrol ediniz.',
      fieldErrors: {
        email: 'Geçersiz e-posta formatı',
        password: 'Şifre en az 8 karakter olmalıdır',
      },
    });

    const { user, container } = render(<LoginForm />);

    const emailInput = screen.getByLabelText(/e-posta adresi/i);
    const passwordInput = screen.getByLabelText(/şifre/i);
    const form = container.querySelector('form')!;

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'short');
    
    await act(async () => {
      form.requestSubmit();
    });

    expect(await screen.findByText('Geçersiz e-posta formatı')).toBeInTheDocument();
    expect(screen.getByText('Şifre en az 8 karakter olmalıdır')).toBeInTheDocument();
    expect(screen.getByText('Lütfen bilgilerinizi kontrol ediniz.')).toBeInTheDocument();

    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('displays global error banner when action returns an error message', async () => {
    vi.mocked(actions.loginAction).mockResolvedValueOnce({
      success: false,
      error: 'E-posta veya şifre hatalı.',
    });

    const { user, container } = render(<LoginForm />);
    const form = container.querySelector('form')!;

    await user.type(screen.getByLabelText(/e-posta adresi/i), 'user@domain.com');
    await user.type(screen.getByLabelText(/şifre/i), 'WrongPass123!');
    
    await act(async () => {
      form.requestSubmit();
    });

    expect(await screen.findByText('E-posta veya şifre hatalı.')).toBeInTheDocument();
  });
});
