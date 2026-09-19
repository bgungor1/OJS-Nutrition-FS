import { describe, it, expect } from 'vitest';
import { cn, formatPrice, formatDate, formatDateTime } from './utils';

describe('lib/utils', () => {
  describe('cn()', () => {
    it('merges class names and resolves conflicting Tailwind classes', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2');
      expect(cn('text-red-500', undefined, 'font-bold')).toBe('text-red-500 font-bold');
      expect(cn('bg-white dark:bg-black', { 'opacity-50': true, 'hidden': false })).toBe(
        'bg-white dark:bg-black opacity-50',
      );
    });
  });

  describe('formatPrice()', () => {
    it('formats numeric amounts into Turkish Lira currency format', () => {
      const formatted = formatPrice(1250.5);
      expect(formatted).toContain('1.250,50');
      expect(formatted).toContain('₺');
    });

    it('formats zero amount correctly', () => {
      const formatted = formatPrice(0);
      expect(formatted).toContain('0,00');
    });
  });

  describe('formatDate()', () => {
    it('formats ISO date string into Turkish day month year format', () => {
      const result = formatDate('2026-05-15T10:30:00.000Z');
      expect(result).toMatch(/15.*Mayıs.*2026/);
    });

    it('returns the input string gracefully when given an invalid date string', () => {
      expect(formatDate('invalid-date')).toBe('invalid-date');
    });
  });

  describe('formatDateTime()', () => {
    it('formats ISO date string into Turkish date and time format', () => {
      const result = formatDateTime('2026-05-15T14:30:00.000Z');
      expect(result).toContain('2026');
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('returns the input string when given an invalid date string', () => {
      expect(formatDateTime('invalid-date-time')).toBe('invalid-date-time');
    });
  });
});
