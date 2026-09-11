'use client';

import React, { useEffect, useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LocationSelects } from './location-selects';
import { AddressFormFields } from './address-form-fields';
import { createAddressAction, updateAddressAction } from '@/app/(shop)/account/addresses/actions';
import {
  addressSchema,
  addressToFormData,
  DEFAULT_ADDRESS_FORM,
  type AddressFormData,
} from '@/lib/schemas/address';
import { Loader2 } from 'lucide-react';
import type { Address, Country } from '@/types';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Address | null;
  countries: Country[];
}

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  initialData,
  countries,
}) => {
  const [form, setForm] = useState<AddressFormData>(DEFAULT_ADDRESS_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setForm(addressToFormData(initialData, countries[0]?.id));
    setErrors({});
    setGlobalError(null);
  }, [initialData, countries, isOpen]);

  const updateField = <K extends keyof AddressFormData>(key: K, value: AddressFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalError(null);

    const parsed = addressSchema.safeParse({
      ...form,
      country_id: Number(form.country_id),
      region_id: Number(form.region_id),
      subregion_id: Number(form.subregion_id),
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]?.toString();
        if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    startTransition(async () => {
      const result = initialData
        ? await updateAddressAction(initialData.id, parsed.data)
        : await createAddressAction(parsed.data);

      if (!result.success) {
        setGlobalError(result.error || 'İşlem sırasında bir hata oluştu.');
        if (result.fieldErrors) setErrors(result.fieldErrors);
        return;
      }

      onClose();
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}</DialogTitle>
          <DialogDescription>
            Siparişlerinizde teslimat ve faturalandırma için kullanabileceğiniz adres bilgisi.
          </DialogDescription>
        </DialogHeader>

        {globalError && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive font-medium">
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <AddressFormFields data={form} onChange={updateField} errors={errors} disabled={isPending} />

          <LocationSelects
            countries={countries}
            countryId={form.country_id}
            regionId={form.region_id}
            subregionId={form.subregion_id}
            onCountryChange={(id) => setForm((p) => ({ ...p, country_id: id, region_id: '', subregion_id: '' }))}
            onRegionChange={(id) => setForm((p) => ({ ...p, region_id: id, subregion_id: '' }))}
            onSubregionChange={(id) => updateField('subregion_id', id)}
            errors={errors}
            disabled={isPending}
          />

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              İptal
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {initialData ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
