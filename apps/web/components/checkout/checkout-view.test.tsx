import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { CheckoutView } from './checkout-view';
import { useCartStore } from '@/store/cart-store';
import type { Address, CartItemResponse } from '@/types';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  redirect: vi.fn(),
}));

const mockAddress: Address = {
  id: 'd3b07384-d113-469b-81d4-8d48695026ff',
  title: 'Ev',
  first_name: 'Ahmet',
  last_name: 'Yılmaz',
  phone_number: '05551234567',
  country_id: 1,
  region_id: 34,
  subregion_id: 450,
  full_address: 'Kadıköy Moda Caddesi No: 12',
};

const mockItem: CartItemResponse = {
  id: 'item_1',
  product_id: 'prod_1',
  product_variant_id: 'var_1',
  pieces: 1,
  created_at: '2026-09-14T12:00:00.000Z',
  product: {
    id: 'prod_1',
    name: 'Whey Protein',
    slug: 'whey-protein',
    photo_src: 'media/products/whey.jpg',
  },
  variant: {
    id: 'var_1',
    aroma: 'Çikolata',
    size: {
      gram: 1000,
      pieces: 1,
      total_services: 30,
    },
    price: {
      total_price: 500,
      discounted_price: null,
      price_per_servings: 16.6,
      discount_percentage: null,
      profit: null,
    },
    photo_src: 'media/products/whey.jpg',
    is_available: true,
    stock_quantity: 10,
  },
};

describe('CheckoutView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCartStore.setState({ items: [], isLoading: false });
  });

  it('renders empty cart view when no cart items exist', () => {
    render(<CheckoutView initialAddresses={[mockAddress]} countries={[]} />);

    expect(screen.getByText('Sepetiniz Boş')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /alışverişe başla/i })).toBeInTheDocument();
  });

  it('renders checkout sections when cart contains items', () => {
    useCartStore.setState({ items: [mockItem] });
    render(<CheckoutView initialAddresses={[mockAddress]} countries={[]} />);

    expect(screen.getByText('Teslimat Adresi')).toBeInTheDocument();
    expect(screen.getByText('Kart Bilgileri')).toBeInTheDocument();
    expect(screen.getByText(/Sipariş Özeti/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /siparişi onayla/i })).toBeInTheDocument();
  });

  it('displays validation errors when submitting with empty card fields', async () => {
    useCartStore.setState({ items: [mockItem] });
    const { user } = render(
      <CheckoutView initialAddresses={[mockAddress]} countries={[]} />,
    );

    const submitButton = screen.getByRole('button', { name: /siparişi onayla/i });
    await user.click(submitButton);

    expect(screen.getByText(/kart üzerindeki ad en az 3 karakter/i)).toBeInTheDocument();
    expect(screen.getByText(/kart numarası 15 veya 16 haneli/i)).toBeInTheDocument();
    expect(screen.getByText(/onaylamalısınız/i)).toBeInTheDocument();
  });

  it('triggers onCompleteCheckout when form is valid', async () => {
    const handleCheckout = vi.fn().mockResolvedValue(undefined);
    useCartStore.setState({ items: [mockItem] });
    const { user } = render(
      <CheckoutView
        initialAddresses={[mockAddress]}
        countries={[]}
        onCompleteCheckout={handleCheckout}
      />,
    );

    await user.type(screen.getByPlaceholderText('Ad'), 'Ahmet');
    await user.type(screen.getByPlaceholderText('Soyad'), 'Yilmaz');
    await user.type(screen.getByPlaceholderText('•••• •••• •••• ••••'), '4532015112830366');
    await user.selectOptions(screen.getByLabelText(/son kullanma ayı/i), '12');
    await user.selectOptions(screen.getByLabelText(/son kullanma yılı/i), '28');
    await user.type(screen.getByPlaceholderText('•••'), '123');
    await user.click(screen.getByRole('checkbox'));

    const submitButton = screen.getByRole('button', { name: /siparişi onayla/i });
    await user.click(submitButton);

    expect(handleCheckout).toHaveBeenCalledTimes(1);
    expect(handleCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        address_id: mockAddress.id,
        card_holder: 'Ahmet Yilmaz',
        cvv: '123',
        terms_accepted: true,
      }),
      [mockItem],
    );
  });
});
