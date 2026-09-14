import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@/test/test-utils';
import { RegisterForm } from './register-form';
import * as actions from '@/app/(shop)/login/actions';

vi.mock('@/app/(shop)/login/actions', () => ({
  registerAction: vi.fn(),
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all required registration inputs and submit button', () => {
    render(<RegisterForm redirectTo="/account" />);

    expect(screen.getByLabelText(/^ad$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^soyad$/i)).toBeInTheDocument();
    const emailInput = screen.getByLabelText(/e-posta adresi/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');

    const passwordInput = screen.getByLabelText(/^şifre$/i);
    const password2Input = screen.getByLabelText(/şifre tekrarı/i);
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('required');

    expect(password2Input).toBeInTheDocument();
    expect(password2Input).toHaveAttribute('type', 'password');
    expect(password2Input).toHaveAttribute('required');

    const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
  });

  it('includes the hidden redirect input', () => {
    const { container } = render(<RegisterForm redirectTo="/payment" />);
    const hiddenRedirect = container.querySelector('input[name="redirect"]') as HTMLInputElement;
    expect(hiddenRedirect).toHaveValue('/payment');
  });

  it('allows user to fill in all registration fields', async () => {
    const { user } = render(<RegisterForm />);

    const firstNameInput = screen.getByLabelText(/^ad$/i);
    const lastNameInput = screen.getByLabelText(/^soyad$/i);
    const emailInput = screen.getByLabelText(/e-posta adresi/i);
    const passwordInput = screen.getByLabelText(/^şifre$/i);
    const password2Input = screen.getByLabelText(/şifre tekrarı/i);

    await user.type(firstNameInput, 'Berkant');
    await user.type(lastNameInput, 'Güngör');
    await user.type(emailInput, 'berkant@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.type(password2Input, 'Password123!');

    expect(firstNameInput).toHaveValue('Berkant');
    expect(lastNameInput).toHaveValue('Güngör');
    expect(emailInput).toHaveValue('berkant@example.com');
    expect(passwordInput).toHaveValue('Password123!');
    expect(password2Input).toHaveValue('Password123!');
  });

  it('displays field validation errors when registerAction returns fieldErrors', async () => {
    vi.mocked(actions.registerAction).mockResolvedValueOnce({
      success: false,
      error: 'Lütfen bilgilerinizi kontrol ediniz.',
      fieldErrors: {
        first_name: 'Ad en az 2 karakter olmalıdır',
        last_name: 'Soyad en az 2 karakter olmalıdır',
        email: 'Geçersiz e-posta formatı',
        password: 'Şifre en az 8 karakter olmalıdır',
        password2: 'Şifreler uyuşmuyor',
      },
    });

    const { user, container } = render(<RegisterForm />);
    const form = container.querySelector('form')!;

    await user.type(screen.getByLabelText(/^ad$/i), 'A');
    await user.type(screen.getByLabelText(/^soyad$/i), 'B');
    await user.type(screen.getByLabelText(/e-posta adresi/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^şifre$/i), 'pass');
    await user.type(screen.getByLabelText(/şifre tekrarı/i), 'pass2');

    await act(async () => {
      form.requestSubmit();
    });

    expect(await screen.findByText('Ad en az 2 karakter olmalıdır')).toBeInTheDocument();
    expect(screen.getByText('Soyad en az 2 karakter olmalıdır')).toBeInTheDocument();
    expect(screen.getByText('Geçersiz e-posta formatı')).toBeInTheDocument();
    expect(screen.getByText('Şifre en az 8 karakter olmalıdır')).toBeInTheDocument();
    expect(screen.getByText('Şifreler uyuşmuyor')).toBeInTheDocument();
  });

  it('displays global error banner when registration fails on the server', async () => {
    vi.mocked(actions.registerAction).mockResolvedValueOnce({
      success: false,
      error: 'Bu e-posta adresiyle kayıtlı bir hesap zaten var.',
    });

    const { user, container } = render(<RegisterForm />);
    const form = container.querySelector('form')!;

    await user.type(screen.getByLabelText(/^ad$/i), 'Berkant');
    await user.type(screen.getByLabelText(/^soyad$/i), 'Güngör');
    await user.type(screen.getByLabelText(/e-posta adresi/i), 'existing@domain.com');
    await user.type(screen.getByLabelText(/^şifre$/i), 'Password123!');
    await user.type(screen.getByLabelText(/şifre tekrarı/i), 'Password123!');

    await act(async () => {
      form.requestSubmit();
    });

    expect(await screen.findByText('Bu e-posta adresiyle kayıtlı bir hesap zaten var.')).toBeInTheDocument();
  });
});
