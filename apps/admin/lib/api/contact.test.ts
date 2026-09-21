import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
} from './contact';
import * as apiClient from '@/lib/api-client';
import type { ContactListResponse, ContactMessage } from '@/types';

vi.mock('@/lib/api-client', () => ({
  serverFetch: vi.fn(),
}));

describe('contact API client', () => {
  const mockServerFetch = vi.mocked(apiClient.serverFetch);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockMessage: ContactMessage = {
    id: 'msg-1',
    name: 'Can Yılmaz',
    email: 'can@example.com',
    message: 'Ürünlerin son kullanma tarihi nedir?',
    handled: false,
    created_at: '2026-09-15T12:00:00.000Z',
  };

  describe('listContacts', () => {
    it('calls /contact with query parameters correctly', async () => {
      const mockResponse: ContactListResponse = {
        count: 1,
        results: [mockMessage],
      };
      mockServerFetch.mockResolvedValueOnce(mockResponse);

      const result = await listContacts({
        handled: false,
        limit: 10,
        offset: 0,
      });

      expect(mockServerFetch).toHaveBeenCalledWith(
        '/contact?handled=false&limit=10&offset=0',
      );
      expect(result).toEqual(mockResponse);
    });

    it('calls /contact without parameters when none provided', async () => {
      mockServerFetch.mockResolvedValueOnce({ count: 0, results: [] });

      await listContacts();

      expect(mockServerFetch).toHaveBeenCalledWith('/contact');
    });
  });

  describe('getContactById', () => {
    it('calls /contact/:id with GET', async () => {
      mockServerFetch.mockResolvedValueOnce(mockMessage);

      const result = await getContactById('msg-1');

      expect(mockServerFetch).toHaveBeenCalledWith('/contact/msg-1');
      expect(result).toEqual(mockMessage);
    });
  });

  describe('updateContactStatus', () => {
    it('calls /contact/:id with PUT and payload', async () => {
      const updated = { ...mockMessage, handled: true };
      mockServerFetch.mockResolvedValueOnce(updated);

      const result = await updateContactStatus('msg-1', { handled: true });

      expect(mockServerFetch).toHaveBeenCalledWith('/contact/msg-1', {
        method: 'PUT',
        body: JSON.stringify({ handled: true }),
      });
      expect(result).toEqual(updated);
    });
  });

  describe('deleteContact', () => {
    it('calls /contact/:id with DELETE', async () => {
      mockServerFetch.mockResolvedValueOnce({ id: 'msg-1' });

      const result = await deleteContact('msg-1');

      expect(mockServerFetch).toHaveBeenCalledWith('/contact/msg-1', {
        method: 'DELETE',
      });
      expect(result).toEqual({ id: 'msg-1' });
    });
  });
});
