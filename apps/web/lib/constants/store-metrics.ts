export interface StoreMetrics {
  totalReviewsCount: number;
  totalReviewsDisplay: string;
  satisfactionRate: number;
  satisfactionRateDisplay: string;
  averageRating: number;
  averageRatingDisplay: string;
  activeCustomersCount: number;
  activeCustomersDisplay: string;
}

export const DEFAULT_STORE_METRICS: StoreMetrics = {
  totalReviewsCount: 198000,
  totalReviewsDisplay: '198.000+',
  satisfactionRate: 99,
  satisfactionRateDisplay: '%99',
  averageRating: 4.9,
  averageRatingDisplay: '4.9 / 5.0',
  activeCustomersCount: 200000,
  activeCustomersDisplay: '200K+',
};

export function formatReviewCount(count: number): string {
  if (count >= 1000) {
    return `${count.toLocaleString('tr-TR')}+`;
  }
  return count.toLocaleString('tr-TR');
}

export function formatSatisfactionRate(rate: number): string {
  return `%${Math.round(rate)}`;
}
