import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import { ProductsToolbar } from './products-toolbar';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe('components/products/products-toolbar', () => {
  const mockCategories = [
    { id: 'cat-1', name: 'Protein', slug: 'protein' },
    { id: 'cat-2', name: 'Vitamin', slug: 'vitamin' },
  ];

  it('renders search input and category filter with options', () => {
    render(
      <ProductsToolbar
        categories={mockCategories}
        search="whey"
        category="protein"
      />,
    );

    const searchInput = screen.getByRole('searchbox', { name: /ürün ara/i });
    expect(searchInput).toHaveValue('whey');

    expect(screen.getByRole('combobox', { name: /kategoriye göre filtrele/i })).toHaveValue('protein');
    expect(screen.getByText('Tüm Kategoriler')).toBeInTheDocument();
    expect(screen.getByText('Protein')).toBeInTheDocument();
    expect(screen.getByText('Vitamin')).toBeInTheDocument();
  });

  it('updates category filter on select change', () => {
    render(<ProductsToolbar categories={mockCategories} />);

    const select = screen.getByRole('combobox', { name: /kategoriye göre filtrele/i });
    fireEvent.change(select, { target: { value: 'vitamin' } });

    expect(mockPush).toHaveBeenCalledWith('?category=vitamin');
  });

  it('submits search query and triggers router.push', () => {
    mockPush.mockClear();
    render(<ProductsToolbar categories={mockCategories} />);

    const searchInput = screen.getByRole('searchbox', { name: /ürün ara/i });
    fireEvent.change(searchInput, { target: { value: 'kreatin' } });
    fireEvent.submit(searchInput.closest('form')!);

    expect(mockPush).toHaveBeenCalledWith('?search=kreatin');
  });
});
