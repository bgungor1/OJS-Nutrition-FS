'use server';

import { revalidatePath } from 'next/cache';
import { updateUserRole } from '@/lib/api/users';
import type { Role } from '@/types';

export async function updateUserRoleAction(userId: string, role: Role) {
  const result = await updateUserRole(userId, { role });
  revalidatePath('/users');
  revalidatePath(`/users/${userId}`);
  revalidatePath('/');
  return result;
}
