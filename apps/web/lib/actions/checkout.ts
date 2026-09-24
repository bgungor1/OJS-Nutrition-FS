'use server';

import { revalidatePath } from 'next/cache';
import { getAccessToken } from '@/lib/auth-cookies';
import { completeShopping } from '@/lib/api/orders';
import { checkoutPaymentSchema } from '@/lib/schemas/checkout';
import { ApiError, serverFetch } from '@/lib/api-client';
import { mergeGuestCartSession } from '@/lib/auth-session';
import type { CheckoutFormData } from '@/lib/schemas/checkout';
import type { CartItemResponse } from '@/types';

export interface CompleteCheckoutResult {
  success: boolean;
  orderId?: string;
  orderNo?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function completeCheckoutAction(
  data: CheckoutFormData,
  clientCartItems?: CartItemResponse[],
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

  // 1. İstemci tarafı açıkça boş bir sepet ilettiyse ödeme adımını durdur
  if (clientCartItems !== undefined && clientCartItems.length === 0) {
    return {
      success: false,
      error: 'Sepetinizde ürün bulunmamaktadır.',
    };
  }

  // 2. Varsa guest_cart_id çerezini oturumla birleştir
  await mergeGuestCartSession(token);

  // 3. İstemciden (Zustand) gelen sepet kalemleri varsa sunucu sepetiyle senkronize et
  if (clientCartItems && clientCartItems.length > 0) {
    try {
      const serverCart = await serverFetch<CartItemResponse[]>('/cart', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      const serverMap = new Map(
        serverCart.map((item) => [item.product_variant_id, item]),
      );

      // İstemcideki kalemleri sunucu sepetine ekle veya adetlerini eşitle
      for (const clientItem of clientCartItems) {
        const existing = serverMap.get(clientItem.product_variant_id);
        if (!existing) {
          await serverFetch('/cart', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              product_id: clientItem.product_id,
              product_variant_id: clientItem.product_variant_id,
              pieces: clientItem.pieces,
            }),
            cache: 'no-store',
          });
        } else if (existing.pieces < clientItem.pieces) {
          const diff = clientItem.pieces - existing.pieces;
          await serverFetch('/cart', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              product_id: clientItem.product_id,
              product_variant_id: clientItem.product_variant_id,
              pieces: diff,
            }),
            cache: 'no-store',
          });
        } else if (existing.pieces > clientItem.pieces) {
          const diff = existing.pieces - clientItem.pieces;
          await serverFetch('/cart', {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              product_id: clientItem.product_id,
              product_variant_id: clientItem.product_variant_id,
              pieces: diff,
            }),
            cache: 'no-store',
          });
        }
      }

      // Sunucuda olup istemci sepetinde artık bulunmayan fazlalık kalemleri temizle
      const clientVariantIds = new Set(
        clientCartItems.map((item) => item.product_variant_id),
      );
      for (const serverItem of serverCart) {
        if (!clientVariantIds.has(serverItem.product_variant_id)) {
          await serverFetch('/cart', {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              product_id: serverItem.product_id,
              product_variant_id: serverItem.product_variant_id,
              pieces: serverItem.pieces,
            }),
            cache: 'no-store',
          });
        }
      }
    } catch (syncErr: unknown) {
      if (syncErr instanceof ApiError) {
        return {
          success: false,
          error: syncErr.message || 'Sepet ürünleri güncellenirken bir hata oluştu.',
          fieldErrors: syncErr.reason,
        };
      }
      console.warn('[completeCheckoutAction] Sepet senkronizasyon uyarısı:', syncErr);
    }
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
