'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';
import type { CheckoutFormData } from '@/lib/schemas/checkout';

interface PaymentExpiryCvvProps {
  values: CheckoutFormData;
  onChange: <K extends keyof CheckoutFormData>(key: K, value: CheckoutFormData[K]) => void;
  onCvvChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: Record<string, string>;
  disabled?: boolean;
}

const MONTHS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const YEARS = ['26', '27', '28', '29', '30', '31', '32', '33', '34', '35'];

export const PaymentExpiryCvv: React.FC<PaymentExpiryCvvProps> = ({
  values,
  onChange,
  onCvvChange,
  errors,
  disabled = false,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-foreground">Son Kullanma Tarihi</label>
        <div className="grid grid-cols-2 gap-2">
          <select
            aria-label="Son kullanma ayı"
            disabled={disabled}
            value={values.expire_month}
            onChange={(e) => onChange('expire_month', e.target.value)}
            className="h-10 px-2 rounded-lg border border-border bg-background text-xs outline-none focus:border-primary"
          >
            <option value="">Ay</option>
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            aria-label="Son kullanma yılı"
            disabled={disabled}
            value={values.expire_year}
            onChange={(e) => onChange('expire_year', e.target.value)}
            className="h-10 px-2 rounded-lg border border-border bg-background text-xs outline-none focus:border-primary"
          >
            <option value="">Yıl</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        {(errors.expire_month || errors.expire_year) && (
          <p className="text-xs text-destructive">
            {errors.expire_month || errors.expire_year}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor="cvv" className="text-xs font-semibold text-foreground">
            CVV
          </label>
          <span title="Güvenlik kodu">
            <HelpCircle className="h-3 w-3 text-muted-foreground" />
          </span>
        </div>
        <input
          id="cvv"
          type="password"
          inputMode="numeric"
          disabled={disabled}
          value={values.cvv}
          onChange={onCvvChange}
          placeholder="•••"
          maxLength={4}
          className={`w-full h-10 px-3 rounded-lg border text-sm font-mono bg-background outline-none tracking-widest ${
            errors.cvv ? 'border-destructive' : 'border-border focus:border-primary'
          }`}
        />
        {errors.cvv && <p className="text-xs text-destructive">{errors.cvv}</p>}
      </div>
    </div>
  );
};
