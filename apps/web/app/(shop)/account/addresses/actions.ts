'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAccessToken } from '@/lib/auth-cookies';
import { createAddress, updateAddress, deleteAddress } from '@/lib/api/addresses';
import { addressSchema } from '@/lib/schemas/address';
import { ApiError } from '@/lib/api-client';
import type { CreateAddressRequest, UpdateAddressRequest } from '@/types';

export interface AddressActionResult {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createAddressAction(
  data: CreateAddressRequest,
): Promise<AddressActionResult> {
  const token = await getAccessToken();
  if (!token) {
    redirect('/login');
  }

  const parsed = addressSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]?.toString();
      if (field && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return { success: false, error: 'Lütfen form alanlarını kontrol ediniz.', fieldErrors };
  }

  try {
    await createAddress(token, parsed.data);
    revalidatePath('/account/addresses');
    return { success: true, message: 'Adres başarıyla kaydedildi.' };
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return { success: false, error: err.message, fieldErrors: err.reason };
    }
    return { success: false, error: 'Adres kaydedilirken bir hata oluştu.' };
  }
}

export async function updateAddressAction(
  id: string,
  data: UpdateAddressRequest,
): Promise<AddressActionResult> {
  const token = await getAccessToken();
  if (!token) {
    redirect('/login');
  }

  const parsed = addressSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]?.toString();
      if (field && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return { success: false, error: 'Lütfen form alanlarını kontrol ediniz.', fieldErrors };
  }

  try {
    await updateAddress(token, id, parsed.data);
    revalidatePath('/account/addresses');
    return { success: true, message: 'Adres başarıyla güncellendi.' };
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return { success: false, error: err.message, fieldErrors: err.reason };
    }
    return { success: false, error: 'Adres güncellenirken bir hata oluştu.' };
  }
}

export async function deleteAddressAction(id: string): Promise<AddressActionResult> {
  const token = await getAccessToken();
  if (!token) {
    redirect('/login');
  }

  try {
    await deleteAddress(token, id);
    revalidatePath('/account/addresses');
    return { success: true, message: 'Adres başarıyla silindi.' };
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: 'Adres silinirken bir hata oluştu.' };
  }
}
