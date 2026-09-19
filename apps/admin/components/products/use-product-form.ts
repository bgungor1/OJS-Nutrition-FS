import * as React from 'react';
import { productSchema, slugifyTurkish } from '@/lib/schemas/product';
import type { ApiProductDetail, CreateProductInput } from '@/types';

export interface ProductFormState {
  name: string;
  slug: string;
  slugManuallyEdited: boolean;
  mainCategoryId: string;
  subCategoryId: string;
  shortExplanation: string;
  usage: string;
  features: string;
  description: string;
  tagsInput: string;
  isBestSeller: boolean;
  bestSellerRank: number | '';
}

export function getInitialFormState(data?: ApiProductDetail): ProductFormState {
  return {
    name: data?.name || '',
    slug: data?.slug || '',
    slugManuallyEdited: Boolean(data?.slug),
    mainCategoryId: data?.main_category_id || '',
    subCategoryId: data?.sub_category_id || '',
    shortExplanation: data?.short_explanation || '',
    usage: data?.explanation?.usage || '',
    features: data?.explanation?.features || '',
    description: data?.explanation?.description || '',
    tagsInput: data?.tags?.join(', ') || '',
    isBestSeller: false,
    bestSellerRank: '',
  };
}

interface UseProductFormOptions {
  initialData?: ApiProductDetail;
  onSubmit: (values: CreateProductInput) => Promise<void>;
}

export function useProductForm({ initialData, onSubmit }: UseProductFormOptions) {
  const [form, setForm] = React.useState<ProductFormState>(() => getInitialFormState(initialData));
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [serverError, setServerError] = React.useState<string | null>(null);

  const updateField = <K extends keyof ProductFormState>(field: K, value: ProductFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: prev.slugManuallyEdited ? prev.slug : slugifyTurkish(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const tags = form.tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    const payload = {
      name: form.name,
      slug: form.slug,
      shortExplanation: form.shortExplanation,
      usage: form.usage,
      features: form.features,
      description: form.description,
      tags,
      mainCategoryId: form.mainCategoryId,
      subCategoryId: form.subCategoryId,
      isBestSeller: form.isBestSeller,
      bestSellerRank: form.bestSellerRank === '' ? null : Number(form.bestSellerRank),
    };

    const parseResult = productSchema.safeParse(payload);
    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parseResult.error.issues) {
        const key = String(issue.path[0]);
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      await onSubmit({
        ...parseResult.data,
        bestSellerRank: parseResult.data.bestSellerRank ?? undefined,
        nutritionalContent: initialData?.explanation?.nutritional_content,
      });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Ürün kaydedilirken hata oluştu.');
    }
  };

  return {
    form,
    errors,
    serverError,
    updateField,
    handleNameChange,
    handleSubmit,
  };
}
