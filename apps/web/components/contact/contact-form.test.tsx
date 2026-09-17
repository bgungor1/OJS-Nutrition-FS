import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { ContactForm } from './contact-form';
import * as contactActions from '@/app/(shop)/contact/actions';

vi.mock('@/app/(shop)/contact/actions', () => ({
  submitContactAction: vi.fn(),
}));

describe('ContactForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all required form fields and submit button', () => {
    render(<ContactForm />);

    const nameInput = screen.getByLabelText(/adınız soyadınız/i);
    const emailInput = screen.getByLabelText(/e-posta adresiniz/i);
    const messageInput = screen.getByLabelText(/mesajınız/i);
    const submitButton = screen.getByRole('button', { name: /mesajı gönder/i });

    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toHaveAttribute('type', 'text');
    expect(nameInput).toHaveAttribute('required');

    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');

    expect(messageInput).toBeInTheDocument();
    expect(messageInput).toHaveAttribute('required');

    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();
  });

  it('allows user to type into name, email, and message inputs', async () => {
    const { user } = render(<ContactForm />);

    const nameInput = screen.getByLabelText(/adınız soyadınız/i);
    const emailInput = screen.getByLabelText(/e-posta adresiniz/i);
    const messageInput = screen.getByLabelText(/mesajınız/i);

    await user.type(nameInput, 'Berkant Güngör');
    await user.type(emailInput, 'berkant@example.com');
    await user.type(messageInput, 'Siparişimin teslimat süresi hakkında bilgi alabilir miyim?');

    expect(nameInput).toHaveValue('Berkant Güngör');
    expect(emailInput).toHaveValue('berkant@example.com');
    expect(messageInput).toHaveValue('Siparişimin teslimat süresi hakkında bilgi alabilir miyim?');
  });

  it('displays field validation errors and sets aria-invalid when action returns errors', async () => {
    vi.mocked(contactActions.submitContactAction).mockResolvedValueOnce({
      success: false,
      message: 'Lütfen formdaki eksik veya hatalı alanları düzeltin.',
      errors: {
        name: ['İsim en az 2 karakter olmalıdır.'],
        email: ['Geçerli bir e-posta adresi giriniz.'],
        message: ['Mesaj en az 10 karakter olmalıdır.'],
      },
    });

    const { user } = render(<ContactForm />);

    await user.type(screen.getByLabelText(/adınız soyadınız/i), 'A');
    await user.type(screen.getByLabelText(/e-posta adresiniz/i), 'a@b.com');
    await user.type(screen.getByLabelText(/mesajınız/i), 'Kısa mesaj');

    const submitButton = screen.getByRole('button', { name: /mesajı gönder/i });
    await user.click(submitButton);

    expect(await screen.findByText('İsim en az 2 karakter olmalıdır.')).toBeInTheDocument();
    expect(screen.getByText('Geçerli bir e-posta adresi giriniz.')).toBeInTheDocument();
    expect(screen.getByText('Mesaj en az 10 karakter olmalıdır.')).toBeInTheDocument();
    expect(screen.getByText('Lütfen formdaki eksik veya hatalı alanları düzeltin.')).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/adınız soyadınız/i);
    expect(nameInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('displays global error alert banner when action returns an error message', async () => {
    vi.mocked(contactActions.submitContactAction).mockResolvedValueOnce({
      success: false,
      message: 'Çok fazla istek gönderdiniz, lütfen 1 dakika bekleyin.',
    });

    const { user } = render(<ContactForm />);

    await user.type(screen.getByLabelText(/adınız soyadınız/i), 'Ahmet Yılmaz');
    await user.type(screen.getByLabelText(/e-posta adresiniz/i), 'ahmet@example.com');
    await user.type(screen.getByLabelText(/mesajınız/i), 'Sipariş detaylarını öğrenmek istiyorum.');

    const submitButton = screen.getByRole('button', { name: /mesajı gönder/i });
    await user.click(submitButton);

    expect(
      await screen.findByText('Çok fazla istek gönderdiniz, lütfen 1 dakika bekleyin.'),
    ).toBeInTheDocument();
  });

  it('renders success view when message submission succeeds', async () => {
    vi.mocked(contactActions.submitContactAction).mockResolvedValueOnce({
      success: true,
      message: 'Mesajınız başarıyla iletildi. En kısa sürede sizinle iletişime geçeceğiz.',
    });

    const { user } = render(<ContactForm />);

    await user.type(screen.getByLabelText(/adınız soyadınız/i), 'Ahmet Yılmaz');
    await user.type(screen.getByLabelText(/e-posta adresiniz/i), 'ahmet@example.com');
    await user.type(screen.getByLabelText(/mesajınız/i), 'Sipariş detaylarını öğrenmek istiyorum.');

    const submitButton = screen.getByRole('button', { name: /mesajı gönder/i });
    await user.click(submitButton);

    expect(await screen.findByText('Mesajınız Alındı')).toBeInTheDocument();
    expect(
      screen.getByText('Mesajınız başarıyla iletildi. En kısa sürede sizinle iletişime geçeceğiz.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /yeni mesaj gönder/i })).toBeInTheDocument();
  });
});
