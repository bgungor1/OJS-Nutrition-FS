import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import { PaymentForm } from './payment-form';
import type { CheckoutFormData } from '@/lib/schemas/checkout';

const defaultValues: CheckoutFormData = {
  address_id: 'addr-1',
  payment_type: 'credit_card',
  card_holder: '',
  card_number: '',
  expire_month: '',
  expire_year: '',
  cvv: '',
  terms_accepted: false,
};

describe('PaymentForm', () => {
  it('renders all form fields, labels, selects, checkbox and security badge', () => {
    render(
      <PaymentForm
        values={defaultValues}
        onChange={vi.fn()}
        errors={{}}
      />,
    );

    expect(screen.getByText('Kart Bilgileri')).toBeInTheDocument();
    expect(screen.getByText(/256-bit ssl/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/kart üzerindeki [iİ]sim/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/kart numarası/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/son kullanma ayı/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/son kullanma yılı/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^cvv$/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('triggers onChange when card holder name is entered', async () => {
    const handleChange = vi.fn();
    const { user } = render(
      <PaymentForm
        values={defaultValues}
        onChange={handleChange}
        errors={{}}
      />,
    );

    const cardHolderInput = screen.getByLabelText(/kart üzerindeki [iİ]sim/i);
    await user.type(cardHolderInput, 'A');

    expect(handleChange).toHaveBeenCalledWith('card_holder', 'A');
  });

  it('formats card number with spaces every 4 digits', () => {
    const handleChange = vi.fn();
    render(
      <PaymentForm
        values={defaultValues}
        onChange={handleChange}
        errors={{}}
      />,
    );

    const cardNumberInput = screen.getByLabelText(/kart numarası/i);
    fireEvent.change(cardNumberInput, { target: { value: '4532015112830366' } });

    expect(handleChange).toHaveBeenCalledWith('card_number', '4532 0151 1283 0366');
  });

  it('strips non-digits and limits CVV to 4 digits', () => {
    const handleChange = vi.fn();
    render(
      <PaymentForm
        values={defaultValues}
        onChange={handleChange}
        errors={{}}
      />,
    );

    const cvvInput = screen.getByLabelText(/^cvv$/i);
    fireEvent.change(cvvInput, { target: { value: 'abc12345' } });

    expect(handleChange).toHaveBeenCalledWith('cvv', '1234');
  });

  it('triggers onChange when selecting expiration month and year', async () => {
    const handleChange = vi.fn();
    const { user } = render(
      <PaymentForm
        values={defaultValues}
        onChange={handleChange}
        errors={{}}
      />,
    );

    const monthSelect = screen.getByLabelText(/son kullanma ayı/i);
    const yearSelect = screen.getByLabelText(/son kullanma yılı/i);

    await user.selectOptions(monthSelect, '05');
    expect(handleChange).toHaveBeenCalledWith('expire_month', '05');

    await user.selectOptions(yearSelect, '28');
    expect(handleChange).toHaveBeenCalledWith('expire_year', '28');
  });

  it('triggers onChange when toggling terms checkbox', async () => {
    const handleChange = vi.fn();
    const { user } = render(
      <PaymentForm
        values={defaultValues}
        onChange={handleChange}
        errors={{}}
      />,
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(handleChange).toHaveBeenCalledWith('terms_accepted', true);
  });

  it('displays field error messages when errors prop is provided', () => {
    const errors = {
      card_holder: 'Kart üzerindeki isim zorunludur.',
      card_number: 'Geçersiz kart numarası.',
      expire_month: 'Son kullanma tarihi geçersiz.',
      cvv: 'CVV 3 veya 4 haneli olmalıdır.',
      terms_accepted: 'Koşulları onaylamalısınız.',
    };

    render(
      <PaymentForm
        values={defaultValues}
        onChange={vi.fn()}
        errors={errors}
      />,
    );

    expect(screen.getByText('Kart üzerindeki isim zorunludur.')).toBeInTheDocument();
    expect(screen.getByText('Geçersiz kart numarası.')).toBeInTheDocument();
    expect(screen.getByText('Son kullanma tarihi geçersiz.')).toBeInTheDocument();
    expect(screen.getByText('CVV 3 veya 4 haneli olmalıdır.')).toBeInTheDocument();
    expect(screen.getByText('Koşulları onaylamalısınız.')).toBeInTheDocument();
  });

  it('disables all inputs, selects and checkbox when disabled prop is true', () => {
    render(
      <PaymentForm
        values={defaultValues}
        onChange={vi.fn()}
        errors={{}}
        disabled={true}
      />,
    );

    expect(screen.getByLabelText(/kart üzerindeki [iİ]sim/i)).toBeDisabled();
    expect(screen.getByLabelText(/kart üzerindeki soyad/i)).toBeDisabled();
    expect(screen.getByLabelText(/kart numarası/i)).toBeDisabled();
    expect(screen.getByLabelText(/son kullanma ayı/i)).toBeDisabled();
    expect(screen.getByLabelText(/son kullanma yılı/i)).toBeDisabled();
    expect(screen.getByLabelText(/^cvv$/i)).toBeDisabled();
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('triggers onChange for both last name and combined card_holder when surname is entered', async () => {
    const handleChange = vi.fn();
    const { user } = render(
      <PaymentForm
        values={{
          ...defaultValues,
          card_holder: 'Ahmet',
          card_holder_first_name: 'Ahmet',
        }}
        onChange={handleChange}
        errors={{}}
      />,
    );

    const lastNameInput = screen.getByLabelText(/kart üzerindeki soyad/i);
    await user.type(lastNameInput, 'Y');

    expect(handleChange).toHaveBeenCalledWith('card_holder_last_name', 'Y');
    expect(handleChange).toHaveBeenCalledWith('card_holder', 'Ahmet Y');
  });

  it('fills test card credentials when "Test Kartı Doldur" button is clicked', async () => {
    const handleChange = vi.fn();
    const { user } = render(
      <PaymentForm
        values={defaultValues}
        onChange={handleChange}
        errors={{}}
      />,
    );

    const fillButton = screen.getByRole('button', { name: /test kartı doldur/i });
    await user.click(fillButton);

    expect(handleChange).toHaveBeenCalledWith('card_holder', 'Ahmet Yılmaz');
    expect(handleChange).toHaveBeenCalledWith('card_number', '5890 0400 0000 0016');
    expect(handleChange).toHaveBeenCalledWith('expire_month', '12');
    expect(handleChange).toHaveBeenCalledWith('expire_year', '28');
    expect(handleChange).toHaveBeenCalledWith('cvv', '123');
    expect(handleChange).toHaveBeenCalledWith('terms_accepted', true);
  });
});
