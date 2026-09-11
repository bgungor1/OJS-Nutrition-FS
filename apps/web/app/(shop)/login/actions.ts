'use server';

import { redirect } from 'next/navigation';
import { loginSchema, registerSchema } from '@/lib/schemas/auth';
import { loginApi, registerApi } from '@/lib/api/auth';
import { setAuthCookies } from '@/lib/auth-cookies';
import { ApiError } from '@/lib/api-client';

export interface AuthActionState {
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

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.errors.forEach((err) => {
      const field = err.path[0]?.toString();
      if (field) fieldErrors[field] = err.message;
    });
    return { success: false, error: 'Lütfen bilgilerinizi kontrol ediniz.', fieldErrors };
  }

  const redirectTo = formData.get('redirect')?.toString() || '/account';

  try {
    const tokens = await loginApi({
      username: parsed.data.email,
      password: parsed.data.password,
    });

    await setAuthCookies(tokens);
    redirect(redirectTo);
  } catch (err: unknown) {
    if (isNextRedirect(err)) throw err;

    if (err instanceof ApiError) {
      return { success: false, error: err.message, fieldErrors: err.reason };
    }

    return { success: false, error: 'Giriş yapılamadı, lütfen bilgilerinizi kontrol ediniz.' };
  }
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const rawData = {
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    email: formData.get('email'),
    password: formData.get('password'),
    password2: formData.get('password2'),
  };

  const parsed = registerSchema.safeParse(rawData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.errors.forEach((err) => {
      const field = err.path[0]?.toString();
      if (field) fieldErrors[field] = err.message;
    });
    return { success: false, error: 'Lütfen bilgilerinizi kontrol ediniz.', fieldErrors };
  }

  const redirectTo = formData.get('redirect')?.toString() || '/account';

  try {
    await registerApi(parsed.data);

    const tokens = await loginApi({
      username: parsed.data.email,
      password: parsed.data.password,
    });

    await setAuthCookies(tokens);
    redirect(redirectTo);
  } catch (err: unknown) {
    if (isNextRedirect(err)) throw err;

    if (err instanceof ApiError) {
      return { success: false, error: err.message, fieldErrors: err.reason };
    }

    return { success: false, error: 'Kayıt işlemi başarısız oldu, lütfen tekrar deneyiniz.' };
  }
}
