'use server';

import { revalidatePath } from 'next/cache';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  createVariant,
  updateVariant,
  deleteVariant,
} from '@/lib/api/products';
import type {
  CreateProductInput,
  UpdateProductInput,
  CreateVariantInput,
  UpdateVariantInput,
} from '@/types';

export async function createProductAction(data: CreateProductInput) {
  const result = await createProduct(data);
  revalidatePath('/products');
  return result;
}

export async function updateProductAction(
  productId: string,
  data: UpdateProductInput,
) {
  const result = await updateProduct(productId, data);
  revalidatePath('/products');
  revalidatePath(`/products/${result.slug}`);
  return result;
}

export async function deleteProductAction(productId: string) {
  await deleteProduct(productId);
  revalidatePath('/products');
}

export async function createVariantAction(
  productId: string,
  data: CreateVariantInput,
) {
  const result = await createVariant(productId, data);
  revalidatePath('/products');
  revalidatePath(`/products/${result.slug}`);
  return result;
}

export async function updateVariantAction(
  productId: string,
  variantId: string,
  data: UpdateVariantInput,
) {
  const result = await updateVariant(productId, variantId, data);
  revalidatePath('/products');
  revalidatePath(`/products/${result.slug}`);
  return result;
}

export async function deleteVariantAction(
  productId: string,
  variantId: string,
) {
  await deleteVariant(productId, variantId);
  revalidatePath('/products');
}

export async function uploadMediaAction(formData: FormData) {
  const { uploadProductMedia } = await import('@/lib/api/products');
  return uploadProductMedia(formData);
}
