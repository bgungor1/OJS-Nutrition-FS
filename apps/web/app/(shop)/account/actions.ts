'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAccessToken } from '@/lib/auth-cookies';
import { updateMyAccount } from '@/lib/api/users';
import { ApiError } from '@/lib/api-client';

export interface ProfileActionState {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

function isNextRedirect(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'digest' in err &&
    typeof (err as { digest: unknown }).digest === 'string' &&
    (err as { digest: string }).digest.startsWith('NEXT_REDIRECT')
  );
}

export async function updateProfileAction(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const token = await getAccessToken();
  if (!token) {
    redirect('/login');
  }

  const firstName = formData.get('first_name')?.toString().trim();
  const lastName = formData.get('last_name')?.toString().trim();
  const phoneNumber = formData.get('phone_number')?.toString().trim();

  const fieldErrors: Record<string, string> = {};

  if (!firstName || firstName.length < 2) {
    fieldErrors.first_name = 'Ad en az 2 karakter olmalıdır.';
  }
  if (!lastName || lastName.length < 2) {
    fieldErrors.last_name = 'Soyad en az 2 karakter olmalıdır.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      error: 'Lütfen form alanlarını kontrol ediniz.',
      fieldErrors,
    };
  }

  try {
    await updateMyAccount(token, {
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber || undefined,
    });

    revalidatePath('/account');
    return {
      success: true,
      message: 'Profil bilgileriniz başarıyla güncellendi.',
    };
  } catch (err: unknown) {
    if (isNextRedirect(err)) throw err;

    if (err instanceof ApiError) {
      return { success: false, error: err.message, fieldErrors: err.reason };
    }

    return { success: false, error: 'Profil güncellenirken bir hata oluştu.' };
  }
}
