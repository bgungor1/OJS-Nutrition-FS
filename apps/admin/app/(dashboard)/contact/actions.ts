'use server';

import { revalidatePath } from 'next/cache';
import { updateContactStatus, deleteContact } from '@/lib/api/contact';

export async function updateContactStatusAction(id: string, handled: boolean) {
  const result = await updateContactStatus(id, { handled });
  revalidatePath('/contact');
  return result;
}

export async function deleteContactAction(id: string) {
  const result = await deleteContact(id);
  revalidatePath('/contact');
  return result;
}
