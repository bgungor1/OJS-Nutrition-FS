import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@/test/test-utils';
import { ProfileForm } from './profile-form';
import * as actions from '@/app/(shop)/account/actions';
import type { AccountProfile } from '@/types';

vi.mock('@/app/(shop)/account/actions', () => ({
  updateProfileAction: vi.fn(),
}));

const mockProfile: AccountProfile = {
  id: 'usr-123',
  first_name: 'Berkant',
  last_name: 'Güngör',
  email: 'berkant@example.com',
  phone_number: '05551234567',
};

describe('ProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form inputs with initial profile data', () => {
    render(<ProfileForm initialData={mockProfile} />);

    const firstNameInput = screen.getByLabelText(/^ad$/i);
    const lastNameInput = screen.getByLabelText(/^soyad$/i);
    const emailInput = screen.getByLabelText(/e-posta adresi/i);
    const phoneInput = screen.getByLabelText(/telefon numarası/i);

    expect(firstNameInput).toHaveValue('Berkant');
    expect(lastNameInput).toHaveValue('Güngör');
    expect(emailInput).toHaveValue('berkant@example.com');
    expect(phoneInput).toHaveValue('05551234567');

    const submitButton = screen.getByRole('button', { name: /değişiklikleri kaydet/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
  });

  it('ensures email input is enabled and editable', () => {
    render(<ProfileForm initialData={mockProfile} />);

    const emailInput = screen.getByLabelText(/e-posta adresi/i);
    expect(emailInput).not.toBeDisabled();
    expect(screen.queryByText(/değiştirilemez/i)).not.toBeInTheDocument();
  });

  it('allows user to modify first name, last name, email and phone number', async () => {
    const { user } = render(<ProfileForm initialData={mockProfile} />);

    const firstNameInput = screen.getByLabelText(/^ad$/i);
    const lastNameInput = screen.getByLabelText(/^soyad$/i);
    const emailInput = screen.getByLabelText(/e-posta adresi/i);
    const phoneInput = screen.getByLabelText(/telefon numarası/i);

    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Ahmet');

    await user.clear(lastNameInput);
    await user.type(lastNameInput, 'Yılmaz');

    await user.clear(emailInput);
    await user.type(emailInput, 'ahmet.yilmaz@example.com');

    await user.clear(phoneInput);
    await user.type(phoneInput, '05559876543');

    expect(firstNameInput).toHaveValue('Ahmet');
    expect(lastNameInput).toHaveValue('Yılmaz');
    expect(emailInput).toHaveValue('ahmet.yilmaz@example.com');
    expect(phoneInput).toHaveValue('05559876543');
  });

  it('displays success message banner when profile update succeeds', async () => {
    vi.mocked(actions.updateProfileAction).mockResolvedValueOnce({
      success: true,
      message: 'Profiliniz başarıyla güncellendi.',
    });

    const { container } = render(<ProfileForm initialData={mockProfile} />);
    const form = container.querySelector('form')!;

    await act(async () => {
      form.requestSubmit();
    });

    expect(await screen.findByText('Profiliniz başarıyla güncellendi.')).toBeInTheDocument();
  });

  it('displays field errors when update validation fails', async () => {
    vi.mocked(actions.updateProfileAction).mockResolvedValueOnce({
      success: false,
      error: 'Lütfen bilgilerinizi kontrol ediniz.',
      fieldErrors: {
        first_name: 'Ad en az 2 karakter olmalıdır.',
      },
    });

    const { container } = render(<ProfileForm initialData={mockProfile} />);
    const form = container.querySelector('form')!;

    await act(async () => {
      form.requestSubmit();
    });

    expect(await screen.findByText('Ad en az 2 karakter olmalıdır.')).toBeInTheDocument();
    expect(screen.getByText('Lütfen bilgilerinizi kontrol ediniz.')).toBeInTheDocument();
  });

  it('displays global error banner when server update fails', async () => {
    vi.mocked(actions.updateProfileAction).mockResolvedValueOnce({
      success: false,
      error: 'Profil güncellenirken bir hata oluştu.',
    });

    const { container } = render(<ProfileForm initialData={mockProfile} />);
    const form = container.querySelector('form')!;

    await act(async () => {
      form.requestSubmit();
    });

    expect(await screen.findByText('Profil güncellenirken bir hata oluştu.')).toBeInTheDocument();
  });
});
