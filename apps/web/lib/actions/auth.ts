'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { clearAuthCookies } from '@/lib/auth-cookies';

export async function logoutAction(): Promise<void> {
  await clearAuthCookies();
  revalidatePath('/', 'layout');
  redirect('/login');
}

