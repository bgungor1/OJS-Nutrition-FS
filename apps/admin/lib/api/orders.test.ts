import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listOrders, getOrderById, updateOrderStatus } from './orders';
import * as apiClient from '@/lib/api-client';
import type { AdminOrderDetail, AdminOrdersPaginatedResponse } from '@/types';

vi.mock('@/lib/api-client', () => ({
  serverFetch: vi.fn(),
}));

describe('orders API client', () => {
  const mockServerFetch = vi.mocked(apiClient.serverFetch);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listOrders', () => {
    it('calls /admin/orders with query parameters correctly', async () => {
      const mockResponse: AdminOrdersPaginatedResponse = {
        count: 1,
        limit: 10,
        offset: 0,
        results: [
          {
            id: 'ord-1',
            orderNo: 'OJS-1001',
            status: 'processing',
            totalPrice: 500,
            shippingFee: 30,
            itemCount: 2,
            createdAt: '2026-09-18T10:00:00.000Z',
            user: { id: 'u-1', email: 'test@example.com' },
          },
        ],
      };

      mockServerFetch.mockResolvedValueOnce(mockResponse);

      const result = await listOrders({
        limit: 10,
        offset: 0,
        status: 'processing',
        search: 'OJS',
        sort: 'date_desc',
      });

      expect(mockServerFetch).toHaveBeenCalledWith(
        '/admin/orders?limit=10&offset=0&status=processing&search=OJS&sort=date_desc',
      );
      expect(result).toEqual(mockResponse);
    });

    it('calls /admin/orders without parameters when none provided', async () => {
      mockServerFetch.mockResolvedValueOnce({ count: 0, limit: 20, offset: 0, results: [] });
      await listOrders();
      expect(mockServerFetch).toHaveBeenCalledWith('/admin/orders');
    });
  });

  describe('getOrderById', () => {
    it('calls /admin/orders/:id with GET', async () => {
      const mockOrder: AdminOrderDetail = {
        id: 'ord-123',
        orderNo: 'OJS-123',
        status: 'delivered',
        totalPrice: 750,
        shippingFee: 0,
        addressSnapshot: { city: 'İstanbul' },
        createdAt: '2026-09-18T12:00:00.000Z',
        updatedAt: '2026-09-18T12:00:00.000Z',
        user: { id: 'u-1', email: 'user@example.com' },
        items: [],
      };

      mockServerFetch.mockResolvedValueOnce(mockOrder);

      const result = await getOrderById('ord-123');

      expect(mockServerFetch).toHaveBeenCalledWith('/admin/orders/ord-123');
      expect(result).toEqual(mockOrder);
    });
  });

  describe('updateOrderStatus', () => {
    it('calls /admin/orders/:id/status with PATCH and body', async () => {
      const mockUpdated: AdminOrderDetail = {
        id: 'ord-123',
        orderNo: 'OJS-123',
        status: 'shipped',
        totalPrice: 750,
        shippingFee: 0,
        addressSnapshot: {},
        createdAt: '2026-09-18T12:00:00.000Z',
        updatedAt: '2026-09-18T13:00:00.000Z',
        user: { id: 'u-1', email: 'user@example.com' },
        items: [],
      };

      mockServerFetch.mockResolvedValueOnce(mockUpdated);

      const result = await updateOrderStatus('ord-123', { status: 'shipped' });

      expect(mockServerFetch).toHaveBeenCalledWith('/admin/orders/ord-123/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'shipped' }),
      });
      expect(result).toEqual(mockUpdated);
    });
  });
});
