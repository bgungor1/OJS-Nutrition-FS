'use server';

import { redirect } from 'next/navigation';
import { clearAuthCookies } from '@/lib/auth-cookies';

export async function logoutAction(): Promise<void> {
  await clearAuthCookies();
  redirect('/login');
}
