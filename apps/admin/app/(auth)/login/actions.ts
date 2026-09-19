'use server';

import { redirect } from 'next/navigation';
import { adminLoginSchema } from '@/lib/schemas/auth';
import { decodeJwtPayload } from '@/lib/jwt';
import { setAuthCookies } from '@/lib/auth-cookies';
import type { ApiResponse, TokensResponse } from '@/types';

export interface AdminLoginActionState {
  success: boolean;
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

export async function adminLoginAction(
  _prevState: AdminLoginActionState,
  formData: FormData,
): Promise<AdminLoginActionState> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };
  const redirectTo = (formData.get('redirect') as string) || '/';

  const parsed = adminLoginSchema.safeParse(rawData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((err) => {
      const field = err.path[0]?.toString();
      if (field) fieldErrors[field] = err.message;
    });
    return {
      success: false,
      fieldErrors,
      error: 'Lütfen formu eksiksiz ve doğru doldurunuz.',
    };
  }

  const { email, password } = parsed.data;
  const apiUrl = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';

  try {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: email,
        password,
      }),
    });

    const json = (await response.json()) as ApiResponse<TokensResponse>;

    if (!response.ok || json.status === 'error') {
      return {
        success: false,
        error: json.message || 'E-posta veya şifre hatalı.',
      };
    }

    const { access, refresh } = json.data;
    const payload = decodeJwtPayload(access);

    if (!payload || payload.role !== 'admin') {
      return {
        success: false,
        error: 'Bu panele erişim için yönetici (admin) yetkisi gereklidir.',
      };
    }

    await setAuthCookies({ access, refresh });
  } catch (err) {
    if (isNextRedirect(err)) throw err;
    return {
      success: false,
      error: 'Sunucuya bağlanılamadı. Lütfen API servisinin çalıştığından emin olun.',
    };
  }

  redirect(redirectTo);
}
