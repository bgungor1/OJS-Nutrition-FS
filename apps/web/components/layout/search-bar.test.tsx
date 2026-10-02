import * as React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@/test/test-utils';
import { SearchBar } from './search-bar';

const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockPathname = '/';
let mockSearchParams = new URLSearchParams();

const { mockClientFetch } = vi.hoisted(() => ({ mockClientFetch: vi.fn() }));
vi.mock('@/lib/api-client', () => ({ clientFetch: mockClientFetch }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

describe('SearchBar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/';
    mockSearchParams = new URLSearchParams();
    mockClientFetch.mockResolvedValue({
      count: 0,
      results: [],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders search input with accessibility attributes', () => {
    render(<SearchBar />);

    expect(screen.getByRole('search')).toBeInTheDocument();
    const input = screen.getByPlaceholderText('Aradığınız ürünü veya kategoriyi yazın...');
    expect(input).toBeInTheDocument();
  });

  it('navigates to /products with search query when submitted from another page', () => {
    mockPathname = '/';
    const onSearchComplete = vi.fn();
    render(<SearchBar onSearchComplete={onSearchComplete} />);

    const input = screen.getByPlaceholderText('Aradığınız ürünü veya kategoriyi yazın...');
    fireEvent.change(input, { target: { value: 'creatine' } });
    fireEvent.submit(screen.getByRole('search'));

    expect(mockPush).toHaveBeenCalledWith('/products?search=creatine');
    expect(onSearchComplete).toHaveBeenCalled();
  });

  it('debounces input changes when on /products page', async () => {
    vi.useFakeTimers();
    mockPathname = '/products';
    mockSearchParams = new URLSearchParams('category=protein');

    render(<SearchBar debounceMs={300} />);

    const input = screen.getByPlaceholderText('Aradığınız ürünü veya kategoriyi yazın...');
    act(() => {
      fireEvent.change(input, { target: { value: 'isolate' } });
    });

    expect(mockReplace).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('/products?category=protein&search=isolate'),
      { scroll: false },
    );
  });

  it('shows clear button when query is entered and clears input and URL on click', () => {
    mockPathname = '/products';
    mockSearchParams = new URLSearchParams('search=protein');

    render(<SearchBar debounceMs={0} />);

    const clearBtn = screen.getByRole('button', { name: 'Aramayı Temizle' });
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);

    const input = screen.getByPlaceholderText('Aradığınız ürünü veya kategoriyi yazın...') as HTMLInputElement;
    expect(input.value).toBe('');
    expect(mockReplace).toHaveBeenCalledWith('/products', { scroll: false });
  });

  const createMockProduct = (name: string, slug: string) => ({
    id: `prod-${slug}`,
    name,
    short_explanation: 'Açıklama',
    slug,
    price_info: { total_price: 1000, discounted_price: 800, profit: null, price_per_servings: null, discount_percentage: null },
    photo_src: '/img.jpg',
    comment_count: 10,
    average_star: 5,
  });

  it('displays instant search dropdown when results are returned from API', async () => {
    mockClientFetch.mockResolvedValueOnce({
      count: 1,
      results: [createMockProduct('Whey Protein Isolate', 'whey-protein-isolate')],
    });

    render(<SearchBar debounceMs={50} />);

    const input = screen.getByPlaceholderText('Aradığınız ürünü veya kategoriyi yazın...');
    fireEvent.change(input, { target: { value: 'whey' } });

    expect(await screen.findByText('Whey Protein Isolate')).toBeInTheDocument();
    expect(screen.getByText('Tüm sonuçları gör (1 ürün)')).toBeInTheDocument();
  });

  it('displays empty state when search returns no products', async () => {
    mockClientFetch.mockResolvedValueOnce({ count: 0, results: [] });

    render(<SearchBar debounceMs={50} />);

    const input = screen.getByPlaceholderText('Aradığınız ürünü veya kategoriyi yazın...');
    fireEvent.change(input, { target: { value: 'bilinmeyenurun' } });

    expect(await screen.findByText(/"bilinmeyenurun" ile eşleşen ürün bulunamadı/)).toBeInTheDocument();
  });

  it('closes dropdown when Escape key is pressed', async () => {
    mockClientFetch.mockResolvedValueOnce({
      count: 1,
      results: [createMockProduct('Creatine Monohydrate', 'creatine-monohydrate')],
    });

    render(<SearchBar debounceMs={50} />);

    const input = screen.getByPlaceholderText('Aradığınız ürünü veya kategoriyi yazın...');
    fireEvent.change(input, { target: { value: 'creatine' } });

    expect(await screen.findByText('Creatine Monohydrate')).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByText('Creatine Monohydrate')).not.toBeInTheDocument();
  });
});
