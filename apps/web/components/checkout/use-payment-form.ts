'use client';

import React from 'react';
import { formatCardNumber } from '@/lib/utils/card';
import type { CheckoutFormData } from '@/lib/schemas/checkout';

interface UsePaymentFormProps {
  values: CheckoutFormData;
  onChange: <K extends keyof CheckoutFormData>(
    key: K,
    value: CheckoutFormData[K],
  ) => void;
}

export function usePaymentForm({ values, onChange }: UsePaymentFormProps) {
  const nameParts = (values.card_holder || '').trim().split(/\s+/);
  const firstName =
    values.card_holder_first_name !== undefined &&
    values.card_holder_first_name !== ''
      ? values.card_holder_first_name
      : nameParts.length > 1
        ? nameParts.slice(0, -1).join(' ')
        : nameParts[0] || '';

  const lastName =
    values.card_holder_last_name !== undefined &&
    values.card_holder_last_name !== ''
      ? values.card_holder_last_name
      : nameParts.length > 1
        ? nameParts[nameParts.length - 1]
        : '';

  const handleFirstName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange('card_holder_first_name', val);
    const combined = [val.trim(), lastName.trim()].filter(Boolean).join(' ');
    onChange('card_holder', combined);
  };

  const handleLastName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange('card_holder_last_name', val);
    const combined = [firstName.trim(), val.trim()].filter(Boolean).join(' ');
    onChange('card_holder', combined);
  };

  const handleFillTestCard = () => {
    onChange('card_holder_first_name', 'Ahmet');
    onChange('card_holder_last_name', 'Yılmaz');
    onChange('card_holder', 'Ahmet Yılmaz');
    onChange('card_number', '5890 0400 0000 0016');
    onChange('expire_month', '12');
    onChange('expire_year', '28');
    onChange('cvv', '123');
    onChange('terms_accepted', true);
  };

  const handleCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('card_number', formatCardNumber(e.target.value));
  };

  const handleCvv = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4));
  };

  return {
    firstName,
    lastName,
    handleFirstName,
    handleLastName,
    handleFillTestCard,
    handleCardNumber,
    handleCvv,
  };
}
