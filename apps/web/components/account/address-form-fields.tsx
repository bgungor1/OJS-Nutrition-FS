'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { AddressFormData } from '@/lib/schemas/address';

interface AddressFormFieldsProps {
  data: AddressFormData;
  onChange: <K extends keyof AddressFormData>(key: K, value: AddressFormData[K]) => void;
  errors: Record<string, string>;
  disabled?: boolean;
}

export const AddressFormFields: React.FC<AddressFormFieldsProps> = ({
  data,
  onChange,
  errors,
  disabled = false,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="address-title">Adres Başlığı</Label>
        <Input
          id="address-title"
          placeholder="Örn: Evim, İş Yeri"
          value={data.title}
          onChange={(e) => onChange('title', e.target.value)}
          aria-invalid={!!errors.title}
          disabled={disabled}
        />
        {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="first_name">Alıcı Adı</Label>
          <Input
            id="first_name"
            value={data.first_name}
            onChange={(e) => onChange('first_name', e.target.value)}
            aria-invalid={!!errors.first_name}
            disabled={disabled}
          />
          {errors.first_name && <p className="text-xs text-destructive">{errors.first_name}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="last_name">Alıcı Soyadı</Label>
          <Input
            id="last_name"
            value={data.last_name}
            onChange={(e) => onChange('last_name', e.target.value)}
            aria-invalid={!!errors.last_name}
            disabled={disabled}
          />
          {errors.last_name && <p className="text-xs text-destructive">{errors.last_name}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone_number">Telefon Numarası</Label>
        <Input
          id="phone_number"
          type="tel"
          placeholder="05551234567"
          value={data.phone_number}
          onChange={(e) => onChange('phone_number', e.target.value)}
          aria-invalid={!!errors.phone_number}
          disabled={disabled}
        />
        {errors.phone_number && <p className="text-xs text-destructive">{errors.phone_number}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="full_address">Açık Adres</Label>
        <Textarea
          id="full_address"
          placeholder="Mahalle, cadde, sokak, bina ve daire numarası"
          value={data.full_address}
          onChange={(e) => onChange('full_address', e.target.value)}
          aria-invalid={!!errors.full_address}
          disabled={disabled}
          rows={3}
        />
        {errors.full_address && <p className="text-xs text-destructive">{errors.full_address}</p>}
      </div>
    </div>
  );
};
