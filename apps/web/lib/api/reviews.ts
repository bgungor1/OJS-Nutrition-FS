import { serverFetch } from '../api-client';
import type {
  ApiReview,
  CreateReviewPayload,
  PaginatedReviewsResponse,
  ReviewQueryParams,
} from '@/types';

export async function getProductReviews(
  slug: string,
  params?: ReviewQueryParams,
): Promise<PaginatedReviewsResponse> {
  const searchParams = new URLSearchParams();

  if (params?.limit !== undefined) {
    searchParams.set('limit', params.limit.toString());
  }
  if (params?.offset !== undefined) {
    searchParams.set('offset', params.offset.toString());
  }
  if (params?.rating !== undefined) {
    searchParams.set('rating', params.rating.toString());
  }
  if (params?.sort !== undefined) {
    searchParams.set('sort', params.sort);
  }

  const queryString = searchParams.toString();
  const endpoint = `/products/${encodeURIComponent(slug)}/reviews${queryString ? `?${queryString}` : ''}`;

  return serverFetch<PaginatedReviewsResponse>(endpoint, {
    next: {
      tags: ['reviews', `product-${slug}-reviews`],
      revalidate: 60,
    },
  });
}

export async function createProductReview(
  slug: string,
  token: string,
  payload: CreateReviewPayload,
): Promise<ApiReview> {
  const endpoint = `/products/${encodeURIComponent(slug)}/reviews`;

  return serverFetch<ApiReview>(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function markReviewHelpful(
  slug: string,
  reviewId: string,
): Promise<ApiReview> {
  const endpoint = `/products/${encodeURIComponent(slug)}/reviews/${encodeURIComponent(reviewId)}/helpful`;

  return serverFetch<ApiReview>(endpoint, {
    method: 'POST',
  });
}

export async function uploadReviewImage(
  slug: string,
  token: string,
  formData: FormData,
): Promise<{ photo_src: string; url: string }> {
  const endpoint = `/products/${encodeURIComponent(slug)}/reviews/upload`;

  return serverFetch<{ photo_src: string; url: string }>(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
}
