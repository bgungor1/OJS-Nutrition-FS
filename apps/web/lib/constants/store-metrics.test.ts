import { describe, it, expect } from 'vitest';
import {
  DEFAULT_STORE_METRICS,
  formatReviewCount,
  formatSatisfactionRate,
} from './store-metrics';

describe('store-metrics utilities', () => {
  it('provides complete and valid default store metrics', () => {
    expect(DEFAULT_STORE_METRICS.totalReviewsCount).toBeGreaterThan(0);
    expect(DEFAULT_STORE_METRICS.totalReviewsDisplay).toBe('198.000+');
    expect(DEFAULT_STORE_METRICS.satisfactionRate).toBe(99);
    expect(DEFAULT_STORE_METRICS.satisfactionRateDisplay).toBe('%99');
    expect(DEFAULT_STORE_METRICS.averageRating).toBe(4.9);
    expect(DEFAULT_STORE_METRICS.averageRatingDisplay).toBe('4.9 / 5.0');
    expect(DEFAULT_STORE_METRICS.activeCustomersDisplay).toBe('200K+');
  });

  it('formats review count correctly with thousands grouping and plus sign', () => {
    expect(formatReviewCount(198000)).toMatch(/198[.,]000\+/);
    expect(formatReviewCount(1500)).toMatch(/1[.,]500\+/);
    expect(formatReviewCount(500)).toBe('500');
  });

  it('formats satisfaction rate with percentage symbol', () => {
    expect(formatSatisfactionRate(99)).toBe('%99');
    expect(formatSatisfactionRate(98.6)).toBe('%99');
    expect(formatSatisfactionRate(100)).toBe('%100');
  });
});
