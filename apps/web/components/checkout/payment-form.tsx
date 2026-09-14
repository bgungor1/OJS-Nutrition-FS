'use client';

import React from 'react';
import { CreditCard, Lock, HelpCircle } from 'lucide-react';
import { formatCardNumber } from '@/lib/utils/card';
import type { CheckoutFormData } from '@/lib/schemas/checkout';

interface PaymentFormProps {
  values: CheckoutFormData;
  onChange: <K extends keyof CheckoutFormData>(key: K, value: CheckoutFormData[K]) => void;
  errors: Record<string, string>;
  disabled?: boolean;
}

const MONTHS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const YEARS = ['26', '27', '28', '29', '30', '31', '32', '33', '34', '35'];

export const PaymentForm: React.FC<PaymentFormProps> = ({
  values,
  onChange,
  errors,
  disabled = false,
}) => {
  const handleCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('card_number', formatCardNumber(e.target.value));
  };

  const handleCvv = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">Kart Bilgileri</h2>
        </div>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Lock className="h-3.5 w-3.5 text-primary" />
          256-Bit SSL
        </span>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-4">
        <div className="space-y-1">
          <label htmlFor="card_holder" className="text-xs font-semibold text-foreground">
            Kart Üzerindeki İsim
          </label>
          <input
            id="card_holder"
            type="text"
            disabled={disabled}
            value={values.card_holder}
            onChange={(e) => onChange('card_holder', e.target.value)}
            placeholder="Ad Soyad"
            className={`w-full h-10 px-3 rounded-lg border text-sm bg-background outline-none uppercase ${
              errors.card_holder ? 'border-destructive' : 'border-border focus:border-primary'
            }`}
          />
          {errors.card_holder && <p className="text-xs text-destructive">{errors.card_holder}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="card_number" className="text-xs font-semibold text-foreground">
            Kart Numarası
          </label>
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
                {MONTHS.map((m) => (<option key={m} value={m}>{m}</option>))}
              </select>
              <select
                aria-label="Son kullanma yılı"
                disabled={disabled}
                value={values.expire_year}
                onChange={(e) => onChange('expire_year', e.target.value)}
                className="h-10 px-2 rounded-lg border border-border bg-background text-xs outline-none focus:border-primary"
              >
                <option value="">Yıl</option>
                {YEARS.map((y) => (<option key={y} value={y}>{y}</option>))}
              </select>
            </div>
            {(errors.expire_month || errors.expire_year) && (
              <p className="text-xs text-destructive">{errors.expire_month || errors.expire_year}</p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="cvv" className="text-xs font-semibold text-foreground">CVV</label>
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
              onChange={handleCvv}
              placeholder="•••"
              maxLength={4}
              className={`w-full h-10 px-3 rounded-lg border text-sm font-mono bg-background outline-none tracking-widest ${
                errors.cvv ? 'border-destructive' : 'border-border focus:border-primary'
              }`}
            />
            {errors.cvv && <p className="text-xs text-destructive">{errors.cvv}</p>}
          </div>
        </div>

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
