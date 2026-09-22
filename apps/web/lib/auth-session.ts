import { cookies } from 'next/headers';
import { serverFetch } from './api-client';

export interface MergeGuestCartOptions {
  guestCartId?: string;
  onSuccess?: () => void;
}

export async function mergeGuestCartSession(
  accessToken: string,
  options?: MergeGuestCartOptions,
): Promise<boolean> {
  try {
    let guestCartId = options?.guestCartId;
    let cookieStore;

    if (!guestCartId) {
      cookieStore = await cookies();
      guestCartId = cookieStore.get('guest_cart_id')?.value;
    }

    if (!guestCartId) {
      return false;
    }

    await serverFetch('/cart/merge', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Cookie: `guest_cart_id=${guestCartId}`,
      },
      cache: 'no-store',
    });

    if (options?.onSuccess) {
      options.onSuccess();
    } else {
      if (!cookieStore) {
        cookieStore = await cookies();
      }
      cookieStore.delete('guest_cart_id');
    }

    return true;
  } catch (err: unknown) {
    console.warn('[auth-session] Misafir sepeti birleştirilemedi:', err);
    return false;
  }
}
