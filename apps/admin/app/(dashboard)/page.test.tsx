import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import DashboardPage from './page';
import * as dashboardApi from '@/lib/api/dashboard';
import type { DashboardStatsResponse } from '@/types';

vi.mock('@/lib/api/dashboard', () => ({
  getDashboardStats: vi.fn(),
}));

describe('app/(dashboard)/page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockStats: DashboardStatsResponse = {
    summary: {
      totalOrders: 1250,
      totalRevenue: 750000,
      totalUsers: 450,
      totalProducts: 30,
    },
    ordersByStatus: {
      pending: 5,
      processing: 10,
      shipped: 15,
      delivered: 1200,
      cancelled: 12,
      returned: 8,
    },
    recentOrders: [
      {
        id: 'ord-1',
        orderNo: 'ORD-999',
        customerName: 'Test User',
        customerEmail: 'user@test.com',
        totalPrice: 1500,
        status: 'processing',
        itemsCount: 2,
        createdAt: '2026-03-18T12:00:00.000Z',
      },
    ],
    topProducts: [
      {
        productId: 'prod-1',
        productName: 'Gold Whey',
        totalQuantitySold: 200,
        totalRevenue: 150000,
        photoSrc: null,
      },
    ],
    lowStockVariants: [
      {
        variantId: 'var-1',
        productId: 'prod-1',
        productName: 'Gold Whey',
        productSlug: 'gold-whey',
        aroma: 'Çilek',
        gram: 900,
        stockQuantity: 2,
        isAvailable: true,
        photoSrc: '/gold.jpg',
      },
    ],
    salesTrend: [
      {
        date: '2026-03-18',
        orderCount: 15,
        totalRevenue: 25000,
      },
    ],
  };

  it('renders dashboard with all metrics, analytics, and tables when fetch succeeds', async () => {
    vi.mocked(dashboardApi.getDashboardStats).mockResolvedValueOnce(mockStats);

    const PageComponent = await DashboardPage();
    render(PageComponent);

    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByTestId('metric-total-revenue')).toHaveTextContent('₺750.000,00');
    expect(screen.getByTestId('metric-total-orders')).toHaveTextContent('1250');
    expect(screen.getByTestId('metric-total-users')).toHaveTextContent('450');
    expect(screen.getByTestId('metric-total-products')).toHaveTextContent('30');

    expect(screen.getByText('Satış ve Gelir Trendi')).toBeInTheDocument();
    expect(screen.getByText('Sipariş Statü Dağılımı')).toBeInTheDocument();
    expect(screen.getByText('Son Siparişler')).toBeInTheDocument();
    expect(screen.getByText('Kritik Stok Takibi')).toBeInTheDocument();
    expect(screen.getByText('En Çok Satan Ürünler')).toBeInTheDocument();
  });

  it('renders error banner when getDashboardStats fails', async () => {
    vi.mocked(dashboardApi.getDashboardStats).mockRejectedValueOnce(
      new Error('Failed to fetch stats'),
    );

    const PageComponent = await DashboardPage();
    render(PageComponent);

    expect(screen.getByTestId('dashboard-error-banner')).toBeInTheDocument();
    expect(
      screen.getByText('Dashboard verileri yüklenirken bir hata oluştu.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch stats')).toBeInTheDocument();
  });
});
