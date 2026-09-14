import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { CheckoutView } from './checkout-view';
import { useCartStore } from '@/store/cart-store';
import type { Address, CartItemResponse } from '@/types';

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
});
