'use server';

import { revalidatePath } from 'next/cache';
import { getAccessToken } from '@/lib/auth-cookies';
import { completeShopping } from '@/lib/api/orders';
import { checkoutPaymentSchema } from '@/lib/schemas/checkout';
import { ApiError } from '@/lib/api-client';
import type { CheckoutFormData } from '@/lib/schemas/checkout';

export interface CompleteCheckoutResult {
  success: boolean;
  orderId?: string;
  orderNo?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function completeCheckoutAction(
  data: CheckoutFormData,
): Promise<CompleteCheckoutResult> {
  const token = await getAccessToken();
  if (!token) {
    return {
      success: false,
      error: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapınız.',
    };
  }

  const parsed = checkoutPaymentSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]?.toString();
      if (field && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return {
      success: false,
      error: 'Lütfen ödeme formundaki hataları düzeltiniz.',
      fieldErrors,
    };
  }

  const sanitizedCard = data.card_number.replace(/\D/g, '');
  const paymentToken = `tok_sandbox_${sanitizedCard.slice(-4)}_${Date.now()}`;

  try {
    const order = await completeShopping(token, {
      address_id: parsed.data.address_id,
      payment_type: parsed.data.payment_type,
      payment_token: paymentToken,
    });

    revalidatePath('/account/orders');
    revalidatePath('/cart');

    return {
      success: true,
      orderId: order.id,
      orderNo: order.order_no,
    };
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return {
        success: false,
        error: err.message || 'Ödeme işlemi tamamlanamadı.',
        fieldErrors: err.reason,
      };
    }
    return {
      success: false,
      error: 'Ödeme alınırken beklenmeyen bir hata oluştu. Lütfen tekrar deneyiniz.',
    };
  }
}
