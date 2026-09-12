import { describe, it, expect, vi } from 'vitest';
import { formatPrice, formatDate, formatDateTime } from './format';

describe('format utilities', () => {
  describe('formatPrice', () => {
    it('formats numeric amount to Turkish Lira currency format', () => {
      const formatted = formatPrice(1250).replace(/\u00a0/g, ' ');
      expect(formatted).toContain('1.250,00');
      expect(formatted).toMatch(/₺|TL/);
    });

    it('formats decimals with two fraction digits', () => {
      expect(formatPrice(99.9).replace(/\u00a0/g, ' ')).toContain('99,90');
      expect(formatPrice(149.95).replace(/\u00a0/g, ' ')).toContain('149,95');
    });

    it('formats zero and negative amounts properly', () => {
      const zero = formatPrice(0).replace(/\u00a0/g, ' ');
      const negative = formatPrice(-50).replace(/\u00a0/g, ' ');

      expect(zero).toContain('0,00');
      expect(negative).toContain('50,00');
      expect(negative).toContain('-');
    });
  });

  describe('formatDate', () => {
    it('formats valid ISO date string to Turkish long month format', () => {
      const formatted = formatDate('2026-03-15T12:00:00Z');
      expect(formatted).toContain('15');
      expect(formatted).toContain('Mart');
      expect(formatted).toContain('2026');
    });

    it('matches months with correct Turkish names', () => {
      const formatted = formatDate('2026-10-29T12:00:00Z');
      expect(formatted).toContain('29');
      expect(formatted).toContain('Ekim');
      expect(formatted).toContain('2026');
    });

    it('returns safely without throwing when an invalid date is provided', () => {
      expect(() => formatDate('invalid-date')).not.toThrow();
    });

    it('returns original date string when toLocaleDateString throws', () => {
      vi.spyOn(Date.prototype, 'toLocaleDateString').mockImplementationOnce(() => {
        throw new Error('Locale exception');
      });

      expect(formatDate('2026-03-15')).toBe('2026-03-15');
    });
  });

  describe('formatDateTime', () => {
    it('formats date string with hour and minute', () => {
      const formatted = formatDateTime('2026-03-15T14:30:00');
      expect(formatted).toContain('15');
      expect(formatted).toContain('Mart');
      expect(formatted).toContain('2026');
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });

    it('returns safely without throwing when an invalid date is provided', () => {
      expect(() => formatDateTime('not-a-valid-date')).not.toThrow();
    });

    it('returns original date string when toLocaleDateString throws', () => {
      vi.spyOn(Date.prototype, 'toLocaleDateString').mockImplementationOnce(() => {
        throw new Error('Locale exception');
      });

      expect(formatDateTime('2026-03-15T14:30:00')).toBe('2026-03-15T14:30:00');
    });
  });
});
