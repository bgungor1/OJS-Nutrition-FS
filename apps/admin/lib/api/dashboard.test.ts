import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDashboardStats } from './dashboard';
import * as apiClient from '@/lib/api-client';
import type { DashboardStatsResponse } from '@/types';

vi.mock('@/lib/api-client', () => ({
  serverFetch: vi.fn(),
}));

describe('lib/api/dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls serverFetch with correct dashboard stats endpoint and returns response', async () => {
    const mockStats: DashboardStatsResponse = {
      summary: {
        totalOrders: 1240,
        totalRevenue: 845250.75,
        totalUsers: 680,
        totalProducts: 45,
      },
      ordersByStatus: {
        pending: 12,
        processing: 25,
        shipped: 40,
        delivered: 1140,
        cancelled: 15,
        returned: 8,
      },
      recentOrders: [
        {
          id: 'ord-1',
          orderNo: 'ORD-2026-ABCD12',
          customerName: 'Ahmet Yılmaz',
          customerEmail: 'ahmet@example.com',
          totalPrice: 1299.9,
          status: 'processing',
          itemsCount: 3,
          createdAt: '2026-03-18T14:30:00.000Z',
        },
      ],
      topProducts: [
        {
          productId: 'prod-1',
          productName: 'Whey Protein',
          totalQuantitySold: 320,
          totalRevenue: 240000,
          photoSrc: '/media/products/whey.jpg',
        },
      ],
      lowStockVariants: [
        {
          variantId: 'var-1',
          productId: 'prod-1',
          productName: 'Whey Protein',
          productSlug: 'whey-protein',
          aroma: 'Çikolata',
          gram: 1000,
          stockQuantity: 3,
          isAvailable: true,
          photoSrc: '/media/products/whey-cikolata.jpg',
        },
      ],
      salesTrend: [
        {
          date: '2026-03-18',
          orderCount: 14,
          totalRevenue: 12500.5,
        },
      ],
    };

    vi.mocked(apiClient.serverFetch).mockResolvedValueOnce(mockStats);

    const result = await getDashboardStats();

    expect(apiClient.serverFetch).toHaveBeenCalledWith('/admin/dashboard/stats');
    expect(result).toEqual(mockStats);
  });

  it('propagates error when serverFetch rejects', async () => {
    vi.mocked(apiClient.serverFetch).mockRejectedValueOnce(
      new Error('Internal Server Error'),
    );

    await expect(getDashboardStats()).rejects.toThrow('Internal Server Error');
  });
});
