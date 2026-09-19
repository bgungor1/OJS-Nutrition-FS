import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import OrdersPage from './page';
import * as ordersApi from '@/lib/api/orders';

vi.mock('@/lib/api/orders', () => ({
  listOrders: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/orders',
  useSearchParams: () => new URLSearchParams(),
}));

describe('OrdersPage', () => {
  it('renders orders listing page with headers and table', async () => {
    vi.mocked(ordersApi.listOrders).mockResolvedValueOnce({
      count: 1,
      limit: 20,
      offset: 0,
      results: [
        {
          id: 'ord-101',
          orderNo: 'OJS-2026-999',
          status: 'delivered',
          totalPrice: 1250,
          shippingFee: 0,
          itemCount: 4,
          createdAt: '2026-09-18T15:00:00.000Z',
          user: {
            id: 'u-1',
            email: 'deneme@example.com',
            firstName: 'Mehmet',
            lastName: 'Demir',
          },
        },
      ],
    });

    const pageResult = await OrdersPage({
      searchParams: Promise.resolve({}),
    });

    render(pageResult);

    expect(screen.getByText('Sipariş Yönetimi')).toBeInTheDocument();
    expect(screen.getByText('OJS-2026-999')).toBeInTheDocument();
    expect(screen.getByText('Mehmet Demir')).toBeInTheDocument();
    expect(screen.getAllByText('Teslim Edildi').length).toBeGreaterThan(0);
  });
});
