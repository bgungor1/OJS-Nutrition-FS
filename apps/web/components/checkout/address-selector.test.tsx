import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { AddressSelector } from './address-selector';
import type { Address } from '@/types';

const mockAddresses: Address[] = [
  {
    id: 'addr_1',
    title: 'Ev Adresim',
    first_name: 'Ahmet',
    last_name: 'Yılmaz',
    phone_number: '05551234567',
    country_id: 1,
    region_id: 34,
    subregion_id: 450,
    full_address: 'Kadıköy Moda Caddesi No: 12 Daire: 4',
  },
  {
    id: 'addr_2',
    title: 'İş Adresim',
    first_name: 'Ahmet',
    last_name: 'Yılmaz',
    phone_number: '05559876543',
    country_id: 1,
    region_id: 34,
    subregion_id: 460,
    full_address: 'Levent Büyükdere Caddesi No: 199',
  },
];

describe('AddressSelector', () => {
  it('renders addresses list with details and highlights selected address', () => {
    render(
      <AddressSelector
        addresses={mockAddresses}
        selectedAddressId="addr_1"
        onSelectAddressId={vi.fn()}
        onOpenNewAddressModal={vi.fn()}
      />,
    );

    expect(screen.getByText('Ev Adresim')).toBeInTheDocument();
    expect(screen.getByText('İş Adresim')).toBeInTheDocument();
    expect(screen.getByText(/Kadıköy Moda Caddesi/i)).toBeInTheDocument();

    const selectedRadio = screen.getByRole('radio', { name: /Ev Adresim/i });
    expect(selectedRadio).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onSelectAddressId when an address card is clicked', async () => {
    const handleSelect = vi.fn();
    const { user } = render(
      <AddressSelector
        addresses={mockAddresses}
        selectedAddressId="addr_1"
        onSelectAddressId={handleSelect}
        onOpenNewAddressModal={vi.fn()}
      />,
    );

    const secondAddress = screen.getByRole('radio', { name: /İş Adresim/i });
    await user.click(secondAddress);

    expect(handleSelect).toHaveBeenCalledWith('addr_2');
  });

  it('calls onOpenNewAddressModal when Add Address button is clicked', async () => {
    const handleOpenModal = vi.fn();
    const { user } = render(
      <AddressSelector
        addresses={mockAddresses}
        selectedAddressId="addr_1"
        onSelectAddressId={vi.fn()}
        onOpenNewAddressModal={handleOpenModal}
      />,
    );

    const addButton = screen.getByRole('button', { name: /yeni adres/i });
    await user.click(addButton);

    expect(handleOpenModal).toHaveBeenCalledTimes(1);
  });

  it('renders empty prompt when address list is empty', () => {
    render(
      <AddressSelector
        addresses={[]}
        selectedAddressId=""
        onSelectAddressId={vi.fn()}
        onOpenNewAddressModal={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/kayıtlı teslimat adresiniz bulunmuyor/i),
    ).toBeInTheDocument();
  });
});
