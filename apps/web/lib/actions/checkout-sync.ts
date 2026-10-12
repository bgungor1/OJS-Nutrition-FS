import { ApiError, serverFetch } from '@/lib/api-client';
import type { CartItemResponse } from '@/types';

export interface CartSyncResult {
  hasError: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function syncClientCartWithServer(
  token: string,
  clientCartItems: CartItemResponse[],
): Promise<CartSyncResult> {
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

    return { hasError: false };
  } catch (syncErr: unknown) {
    if (syncErr instanceof ApiError) {
      return {
        hasError: true,
        error:
          syncErr.message || 'Sepet ürünleri güncellenirken bir hata oluştu.',
        fieldErrors: syncErr.reason,
      };
    }
    console.warn(
      '[completeCheckoutAction] Sepet senkronizasyon uyarısı:',
      syncErr,
    );
    return { hasError: false };
  }
}
