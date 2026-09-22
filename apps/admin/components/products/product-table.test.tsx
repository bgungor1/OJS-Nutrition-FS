import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import { ProductTable } from './product-table';
import type { ApiProduct } from '@/types';

describe('components/products/product-table', () => {
  const mockProducts: ApiProduct[] = [
    {
      id: 'prod-1',
      name: 'Whey Protein Chocolate',
      slug: 'whey-protein-chocolate',
      short_explanation: 'Delicious chocolate protein',
      photo_src: 'media/products/whey.jpg',
      comment_count: 24,
      average_star: 4.8,
      price_info: {
        total_price: 600,
        discounted_price: 540,
        profit: 60,
        price_per_servings: 18,
        discount_percentage: 10,
      },
    },
    {
      id: 'prod-2',
      name: 'BCAA 4:1:1 Watermelon',
      slug: 'bcaa-411-watermelon',
      short_explanation: 'Refreshment amino acids',
      photo_src: '',
      comment_count: 5,
      average_star: 4.2,
      price_info: {
        total_price: 400,
        discounted_price: null,
        profit: null,
        price_per_servings: 13.33,
        discount_percentage: null,
      },
    },
  ];

  it('renders products list with names, slugs, prices and ratings', () => {
    render(<ProductTable products={mockProducts} />);

    expect(screen.getByText('Whey Protein Chocolate')).toBeInTheDocument();
    expect(screen.getByText('/whey-protein-chocolate')).toBeInTheDocument();
    expect(screen.getByText('₺540,00')).toBeInTheDocument();
    expect(screen.getByText('₺600,00')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();

    expect(screen.getByText('BCAA 4:1:1 Watermelon')).toBeInTheDocument();
    expect(screen.getByText('₺400,00')).toBeInTheDocument();
  });

  it('renders empty fallback when products list is empty', () => {
    render(<ProductTable products={[]} />);

    expect(screen.getByTestId('product-table-empty')).toBeInTheDocument();
    expect(screen.getByText('Kayıtlı Ürün Bulunamadı')).toBeInTheDocument();
  });

  it('opens confirmation dialog and invokes onDelete when confirmed', async () => {
    const mockDelete = vi.fn().mockResolvedValue(undefined);
    render(<ProductTable products={mockProducts} onDelete={mockDelete} />);

    const deleteButtons = screen.getAllByRole('button', { name: /ürünü sil/i });
    fireEvent.click(deleteButtons[0]);

    expect(
      screen.getByText('Ürünü Silmek İstediğinize Emin Misiniz?'),
    ).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /evet, ürünü sil/i });
    fireEvent.click(confirmBtn);

    expect(mockDelete).toHaveBeenCalledWith('prod-1');
  });

  it('displays error message inside dialog when onDelete fails', async () => {
    const mockDelete = vi.fn().mockRejectedValue(new Error('Siparişe bağlı ürün silinemez'));
    render(<ProductTable products={mockProducts} onDelete={mockDelete} />);

    const deleteButtons = screen.getAllByRole('button', { name: /ürünü sil/i });
    fireEvent.click(deleteButtons[0]);

    const confirmBtn = screen.getByRole('button', { name: /evet, ürünü sil/i });
    fireEvent.click(confirmBtn);

    expect(await screen.findByRole('alert')).toHaveTextContent('Siparişe bağlı ürün silinemez');
  });
});
