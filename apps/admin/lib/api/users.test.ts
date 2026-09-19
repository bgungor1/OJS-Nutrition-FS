import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listUsers, getUserById, updateUserRole } from './users';
import * as apiClient from '@/lib/api-client';
import type { AdminUserDetail, AdminUserListItem } from '@/types';
import type { AdminUsersPaginatedResponse } from './users';

vi.mock('@/lib/api-client', () => ({
  serverFetch: vi.fn(),
}));

describe('users API client', () => {
  const mockServerFetch = vi.mocked(apiClient.serverFetch);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listUsers', () => {
    const mockListItem: AdminUserListItem = {
      id: 'u-1',
      email: 'ali@example.com',
      firstName: 'Ali',
      lastName: 'Kaya',
      role: 'customer',
      authProvider: 'local',
      createdAt: '2026-09-01T10:00:00.000Z',
      orderCount: 5,
    };

    it('calls /admin/users with query parameters correctly', async () => {
      const mockResponse: AdminUsersPaginatedResponse = {
        count: 1,
        limit: 20,
        offset: 0,
        results: [mockListItem],
      };

      mockServerFetch.mockResolvedValueOnce(mockResponse);

      const result = await listUsers({
        limit: 20,
        offset: 0,
        role: 'customer',
        search: 'ali',
      });

      expect(mockServerFetch).toHaveBeenCalledWith(
        '/admin/users?limit=20&offset=0&role=customer&search=ali',
      );
      expect(result).toEqual(mockResponse);
    });

    it('calls /admin/users without parameters when none provided', async () => {
      mockServerFetch.mockResolvedValueOnce({ count: 0, limit: 20, offset: 0, results: [] });
      await listUsers();
      expect(mockServerFetch).toHaveBeenCalledWith('/admin/users');
    });
  });

  describe('getUserById', () => {
    it('calls /admin/users/:id with GET', async () => {
      const mockUser: AdminUserDetail = {
        id: 'u-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'customer',
        authProvider: 'local',
        createdAt: '2026-09-01T10:00:00.000Z',
        addresses: [],
        orders: [],
      };

      mockServerFetch.mockResolvedValueOnce(mockUser);

      const result = await getUserById('u-123');

      expect(mockServerFetch).toHaveBeenCalledWith('/admin/users/u-123');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUserRole', () => {
    it('calls /admin/users/:id/role with PATCH and body', async () => {
      const mockUser: AdminUserDetail = {
        id: 'u-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
        authProvider: 'local',
        createdAt: '2026-09-01T10:00:00.000Z',
        addresses: [],
        orders: [],
      };

      mockServerFetch.mockResolvedValueOnce(mockUser);

      const result = await updateUserRole('u-123', { role: 'admin' });

      expect(mockServerFetch).toHaveBeenCalledWith('/admin/users/u-123/role', {
        method: 'PATCH',
        body: JSON.stringify({ role: 'admin' }),
      });
      expect(result).toEqual(mockUser);
    });
  });
});
