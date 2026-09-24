'use client';

import React from 'react';
import { CreditCard, Lock } from 'lucide-react';
import type { CheckoutFormData } from '@/lib/schemas/checkout';
import { usePaymentForm } from './use-payment-form';
import { PaymentCardHolderInputs } from './payment-card-holder-inputs';
import { PaymentExpiryCvv } from './payment-expiry-cvv';

interface PaymentFormProps {
  values: CheckoutFormData;
  onChange: <K extends keyof CheckoutFormData>(key: K, value: CheckoutFormData[K]) => void;
  errors: Record<string, string>;
  disabled?: boolean;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  values,
  onChange,
  errors,
  disabled = false,
}) => {
  const {
    firstName,
    lastName,
    handleFirstName,
    handleLastName,
    handleFillTestCard,
    handleCardNumber,
    handleCvv,
  } = usePaymentForm({ values, onChange });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">Kart Bilgileri</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleFillTestCard}
            disabled={disabled}
            className="text-xs text-primary hover:text-primary/80 font-semibold underline underline-offset-2 cursor-pointer disabled:opacity-50"
          >
            Test Kartı Doldur
          </button>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Lock className="h-3.5 w-3.5 text-primary" />
            256-Bit SSL
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-4">
        <PaymentCardHolderInputs
          firstName={firstName}
          lastName={lastName}
          onFirstNameChange={handleFirstName}
          onLastNameChange={handleLastName}
          error={errors.card_holder}
          disabled={disabled}
        />

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="card_number" className="text-xs font-semibold text-foreground">
              Kart Numarası
            </label>
            <span className="text-[11px] text-muted-foreground">Test kartı veya 16 hane</span>
          </div>
          <input
            id="card_number"
            type="text"
            inputMode="numeric"
            disabled={disabled}
            value={values.card_number}
            onChange={handleCardNumber}
            placeholder="•••• •••• •••• ••••"
            maxLength={19}
            className={`w-full h-10 px-3 rounded-lg border text-sm font-mono bg-background outline-none tracking-wider ${
              errors.card_number ? 'border-destructive' : 'border-border focus:border-primary'
            }`}
          />
          {errors.card_number && <p className="text-xs text-destructive">{errors.card_number}</p>}
        </div>

        <PaymentExpiryCvv
          values={values}
          onChange={onChange}
          onCvvChange={handleCvv}
          errors={errors}
          disabled={disabled}
        />

        <div className="pt-2 border-t border-border/60">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              disabled={disabled}
              checked={values.terms_accepted}
              onChange={(e) => onChange('terms_accepted', e.target.checked)}
              className="mt-1 h-4 w-4 rounded-xs border-border text-primary focus:ring-primary accent-primary"
            />
            <span className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground font-semibold">Ön Bilgilendirme Koşulları</strong> ve{' '}
              <strong className="text-foreground font-semibold">Mesafeli Satış Sözleşmesi</strong>&apos;ni okudum, onaylıyorum.
            </span>
          </label>
          {errors.terms_accepted && <p className="text-xs text-destructive mt-1">{errors.terms_accepted}</p>}
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
