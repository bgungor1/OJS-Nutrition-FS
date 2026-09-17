import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitReviewAction } from './review';
import { getAccessToken } from '@/lib/auth-cookies';
import { createProductReview } from '@/lib/api/reviews';
import { revalidateTag } from 'next/cache';
import { ApiError } from '@/lib/api-client';
import type { ApiReview } from '@/types';

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}));

vi.mock('@/lib/auth-cookies', () => ({
  getAccessToken: vi.fn(),
}));

vi.mock('@/lib/api/reviews', () => ({
  createProductReview: vi.fn(),
}));

const mockReview: ApiReview = {
  id: 'rev_123',
  product_id: 'prod_1',
  reviewer_name: 'Berkant Güngör',
  rating: 5,
  is_verified: true,
  title: 'Muazzam Çözünürlük',
  text: 'Topaklanma yapmıyor, su ve süt ile gayet başarılı karışıyor.',
  images: ['https://example.com/img1.jpg'],
  helpful_count: 0,
  created_at: '2026-09-17T12:00:00.000Z',
};

function createValidFormData(): FormData {
  const formData = new FormData();
  formData.set('rating', '5');
  formData.set('title', 'Muazzam Çözünürlük');
  formData.set('text', 'Topaklanma yapmıyor, su ve süt ile gayet başarılı karışıyor.');
  formData.append('images', 'https://example.com/img1.jpg');
  return formData;
}

describe('submitReviewAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when user is not logged in', async () => {
    vi.mocked(getAccessToken).mockResolvedValue(undefined);

    const formData = createValidFormData();
    const result = await submitReviewAction('whey-protein', null, formData);

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/lütfen giriş yapınız/i);
    expect(createProductReview).not.toHaveBeenCalled();
  });

  it('returns field errors when form data fails Zod validation', async () => {
    vi.mocked(getAccessToken).mockResolvedValue('mock_token');

    const formData = new FormData();
    formData.set('rating', '0'); // invalid: min 1
    formData.set('title', 'A'); // invalid: min 2
    formData.set('text', 'Kısa'); // invalid: min 5

    const result = await submitReviewAction('whey-protein', null, formData);

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/eksik veya hatalı/i);
    expect(result.fieldErrors?.rating).toBeDefined();
    expect(result.fieldErrors?.title).toBeDefined();
    expect(result.fieldErrors?.text).toBeDefined();
    expect(createProductReview).not.toHaveBeenCalled();
  });

  it('successfully creates review and revalidates tags on valid submission', async () => {
    vi.mocked(getAccessToken).mockResolvedValue('valid_token');
    vi.mocked(createProductReview).mockResolvedValue(mockReview);

    const formData = createValidFormData();
    const result = await submitReviewAction('whey-protein', null, formData);

    expect(result.success).toBe(true);
    expect(result.message).toMatch(/başarıyla iletildi/i);
    expect(result.review).toEqual(mockReview);

    expect(createProductReview).toHaveBeenCalledWith('whey-protein', 'valid_token', {
      rating: 5,
      title: 'Muazzam Çözünürlük',
      text: 'Topaklanma yapmıyor, su ve süt ile gayet başarılı karışıyor.',
      images: ['https://example.com/img1.jpg'],
    });

    expect(revalidateTag).toHaveBeenCalledWith('product-whey-protein-reviews');
    expect(revalidateTag).toHaveBeenCalledWith('products');
  });

  it('returns duplicate review error when backend responds with 409 Conflict', async () => {
    vi.mocked(getAccessToken).mockResolvedValue('valid_token');
    vi.mocked(createProductReview).mockRejectedValue(
      new ApiError('Conflict', 409),
    );

    const formData = createValidFormData();
    const result = await submitReviewAction('whey-protein', null, formData);

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/daha önce bir değerlendirme yaptınız/i);
  });

  it('returns API error message when backend throws standard ApiError', async () => {
    vi.mocked(getAccessToken).mockResolvedValue('valid_token');
    vi.mocked(createProductReview).mockRejectedValue(
      new ApiError('Ürün bulunamadı', 404),
    );

    const formData = createValidFormData();
    const result = await submitReviewAction('whey-protein', null, formData);

    expect(result.success).toBe(false);
    expect(result.message).toBe('Ürün bulunamadı');
  });

  it('returns fallback generic error message on unexpected error', async () => {
    vi.mocked(getAccessToken).mockResolvedValue('valid_token');
    vi.mocked(createProductReview).mockRejectedValue(new Error('Network offline'));

    const formData = createValidFormData();
    const result = await submitReviewAction('whey-protein', null, formData);

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/beklenmeyen bir hata oluştu/i);
  });
});
