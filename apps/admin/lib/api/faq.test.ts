import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listFaqs, getFaqById, createFaq, updateFaq, deleteFaq } from './faq';
import * as apiClient from '@/lib/api-client';
import type { FaqItem } from '@/types';

vi.mock('@/lib/api-client', () => ({
  serverFetch: vi.fn(),
}));

describe('faq API client', () => {
  const mockServerFetch = vi.mocked(apiClient.serverFetch);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockFaqItem: FaqItem = {
    id: 'faq-1',
    question: 'Siparişler ne zaman kargoya verilir?',
    answer: 'Hafta içi saat 16:00ya kadar verilen siparişler aynı gün kargolanır.',
    category: 'kargo',
    sort_order: 1,
  };

  describe('listFaqs', () => {
    it('calls /faq with category query when provided', async () => {
      mockServerFetch.mockResolvedValueOnce([mockFaqItem]);

      const result = await listFaqs({ category: 'kargo' });

      expect(mockServerFetch).toHaveBeenCalledWith('/faq?category=kargo');
      expect(result).toEqual([mockFaqItem]);
    });

    it('calls /faq without query when category is not provided', async () => {
      mockServerFetch.mockResolvedValueOnce([mockFaqItem]);

      const result = await listFaqs();

      expect(mockServerFetch).toHaveBeenCalledWith('/faq');
      expect(result).toEqual([mockFaqItem]);
    });
  });

  describe('getFaqById', () => {
    it('calls /faq/:id with GET', async () => {
      mockServerFetch.mockResolvedValueOnce(mockFaqItem);

      const result = await getFaqById('faq-1');

      expect(mockServerFetch).toHaveBeenCalledWith('/faq/faq-1');
      expect(result).toEqual(mockFaqItem);
    });
  });

  describe('createFaq', () => {
    it('calls /faq with POST and payload', async () => {
      mockServerFetch.mockResolvedValueOnce(mockFaqItem);

      const payload = {
        question: 'Siparişler ne zaman kargoya verilir?',
        answer: 'Hafta içi saat 16:00ya kadar verilen siparişler aynı gün kargolanır.',
        category: 'kargo',
        sortOrder: 1,
      };

      const result = await createFaq(payload);

      expect(mockServerFetch).toHaveBeenCalledWith('/faq', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      expect(result).toEqual(mockFaqItem);
    });
  });

  describe('updateFaq', () => {
    it('calls /faq/:id with PUT and payload', async () => {
      mockServerFetch.mockResolvedValueOnce(mockFaqItem);

      const payload = {
        question: 'Güncellenmiş soru?',
      };

      const result = await updateFaq('faq-1', payload);

      expect(mockServerFetch).toHaveBeenCalledWith('/faq/faq-1', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      expect(result).toEqual(mockFaqItem);
    });
  });

  describe('deleteFaq', () => {
    it('calls /faq/:id with DELETE', async () => {
      mockServerFetch.mockResolvedValueOnce({ id: 'faq-1' });

      const result = await deleteFaq('faq-1');

      expect(mockServerFetch).toHaveBeenCalledWith('/faq/faq-1', {
        method: 'DELETE',
      });
      expect(result).toEqual({ id: 'faq-1' });
    });
  });
});
