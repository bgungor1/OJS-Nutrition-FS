import * as React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import { SearchBar } from './search-bar';

const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockPathname = '/';
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

describe('SearchBar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/';
    mockSearchParams = new URLSearchParams();
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
    fireEvent.change(input, { target: { value: 'isolate' } });

    expect(mockReplace).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('/products?category=protein&search=isolate'),
      { scroll: false },
    );
  });

  it('shows clear button when query is entered and clears input and URL on click', () => {
    mockPathname = '/products';
    mockSearchParams = new URLSearchParams('search=protein');

    render(<SearchBar />);

    const clearBtn = screen.getByRole('button', { name: 'Aramayı Temizle' });
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);

    const input = screen.getByPlaceholderText('Aradığınız ürünü veya kategoriyi yazın...') as HTMLInputElement;
    expect(input.value).toBe('');
    expect(mockReplace).toHaveBeenCalledWith('/products', { scroll: false });
  });
});
