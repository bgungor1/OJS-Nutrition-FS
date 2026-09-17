'use server';

import { revalidateTag } from 'next/cache';
import { getAccessToken } from '@/lib/auth-cookies';
import { createProductReview, markReviewHelpful } from '@/lib/api/reviews';
import { createReviewSchema } from '@/lib/schemas/review';
import { ApiError } from '@/lib/api-client';
import type { ApiReview } from '@/types';

export interface ReviewActionResult {
  success: boolean;
  message: string;
  review?: ApiReview;
  fieldErrors?: Record<string, string>;
}

export async function submitReviewAction(
  slug: string,
  _prevState: ReviewActionResult | null,
  formData: FormData,
): Promise<ReviewActionResult> {
  const token = await getAccessToken();
  if (!token) {
    return {
      success: false,
      message: 'Yorum yapabilmek için lütfen giriş yapınız.',
    };
  }

  const rawRating = formData.get('rating');
  const imagesRaw = formData.getAll('images');
  const images: string[] = [];

  for (const img of imagesRaw) {
    if (typeof img === 'string' && img.trim() !== '') {
      images.push(img.trim());
    }
  }

  const rawData = {
    rating: rawRating !== null && rawRating !== '' ? Number(rawRating) : undefined,
    title: formData.get('title'),
    text: formData.get('text'),
    images,
  };

  const validation = createReviewSchema.safeParse(rawData);

  if (!validation.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of validation.error.issues) {
      const field = issue.path[0]?.toString();
      if (field && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }

    return {
      success: false,
      message: 'Lütfen formdaki eksik veya hatalı alanları düzeltin.',
      fieldErrors,
    };
  }

  try {
    const review = await createProductReview(slug, token, validation.data);
    revalidateTag(`product-${slug}-reviews`);
    revalidateTag('products');

    return {
      success: true,
      message: 'Değerlendirmeniz başarıyla iletildi. Katkınız için teşekkür ederiz!',
      review,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 409) {
        return {
          success: false,
          message: 'Bu ürün için daha önce bir değerlendirme yaptınız.',
        };
      }
      return {
        success: false,
        message: error.message || 'Değerlendirme gönderilirken bir hata oluştu.',
      };
    }

    return {
      success: false,
      message: 'Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.',
    };
  }
}

export async function markHelpfulAction(
  slug: string,
  reviewId: string,
): Promise<{ success: boolean; helpful_count?: number; error?: string }> {
  try {
    const updated = await markReviewHelpful(slug, reviewId);
    revalidateTag(`product-${slug}-reviews`);
    return { success: true, helpful_count: updated.helpful_count };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'İşlem gerçekleştirilemedi.',
    };
  }
}

