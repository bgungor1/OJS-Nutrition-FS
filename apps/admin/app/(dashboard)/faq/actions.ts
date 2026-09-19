'use server';

import { revalidatePath } from 'next/cache';
import { createFaq, updateFaq, deleteFaq } from '@/lib/api/faq';
import type { CreateFaqDto, UpdateFaqDto } from '@/types';

export async function createFaqAction(dto: CreateFaqDto) {
  const result = await createFaq(dto);
  revalidatePath('/faq');
  return result;
}

export async function updateFaqAction(id: string, dto: UpdateFaqDto) {
  const result = await updateFaq(id, dto);
  revalidatePath('/faq');
  return result;
}

export async function deleteFaqAction(id: string) {
  const result = await deleteFaq(id);
  revalidatePath('/faq');
  return result;
}
