import * as React from 'react';
import { variantSchema } from '@/lib/schemas/product';
import type { ApiProductVariant, CreateVariantInput } from '@/types';

export interface VariantModalFormState {
  aroma: string;
  gram: number | '';
  pieces: number | '';
  totalServings: number | '';
  totalPrice: number | '';
  discountedPrice: number | '';
  pricePerServing: number | '';
  photoSrc: string;
  isAvailable: boolean;
  stockQuantity: number | '';
}

export function getInitialVariantState(initialData?: ApiProductVariant | null): VariantModalFormState {
  if (initialData) {
    return {
      aroma: initialData.aroma,
      gram: initialData.size.gram,
      pieces: initialData.size.pieces,
      totalServings: initialData.size.total_services,
      totalPrice: initialData.price.total_price,
      discountedPrice: initialData.price.discounted_price ?? '',
      pricePerServing: initialData.price.price_per_servings,
      photoSrc: initialData.photo_src,
      isAvailable: initialData.is_available,
      stockQuantity: 10,
    };
  }
  return {
    aroma: '',
    gram: '',
    pieces: 1,
    totalServings: '',
    totalPrice: '',
    discountedPrice: '',
    pricePerServing: '',
    photoSrc: '',
    isAvailable: true,
    stockQuantity: 10,
  };
}

interface UseVariantModalFormOptions {
  initialData?: ApiProductVariant | null;
  open: boolean;
  onSubmit: (values: CreateVariantInput) => Promise<void>;
  onOpenChange: (open: boolean) => void;
}

export function useVariantModalForm({
  initialData,
  open,
  onSubmit,
  onOpenChange,
}: UseVariantModalFormOptions) {
  const [form, setForm] = React.useState<VariantModalFormState>(() => getInitialVariantState(initialData));
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [serverError, setServerError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setForm(getInitialVariantState(initialData));
    setErrors({});
    setServerError(null);
  }, [initialData, open]);

  const updateField = <K extends keyof VariantModalFormState>(
    field: K,
    value: VariantModalFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePriceOrServingsChange = (
    newPrice: number | '',
    newServings: number | '',
    targetField: 'totalPrice' | 'totalServings',
  ) => {
    setForm((prev) => {
      const price = targetField === 'totalPrice' ? newPrice : prev.totalPrice;
      const servings = targetField === 'totalServings' ? newServings : prev.totalServings;
      const perServing =
        typeof price === 'number' && typeof servings === 'number' && servings > 0
          ? Number((price / servings).toFixed(2))
          : prev.pricePerServing;

      return {
        ...prev,
        [targetField]: targetField === 'totalPrice' ? newPrice : newServings,
        pricePerServing: perServing,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const payload = {
      aroma: form.aroma,
      gram: Number(form.gram),
      pieces: Number(form.pieces) || 1,
      totalServings: Number(form.totalServings),
      totalPrice: Number(form.totalPrice),
      discountedPrice: form.discountedPrice === '' ? null : Number(form.discountedPrice),
      pricePerServing: Number(form.pricePerServing),
      photoSrc: form.photoSrc,
      isAvailable: form.isAvailable,
      stockQuantity: Number(form.stockQuantity) || 0,
    };

    const parseResult = variantSchema.safeParse(payload);
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
        discountedPrice: parseResult.data.discountedPrice ?? undefined,
      });
      onOpenChange(false);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Varyant kaydedilirken hata oluştu.');
    }
  };

  return {
    form,
    errors,
    serverError,
    updateField,
    handlePriceOrServingsChange,
    handleSubmit,
  };
}
