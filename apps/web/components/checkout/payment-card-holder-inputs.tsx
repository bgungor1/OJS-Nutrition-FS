'use client';

import React from 'react';

interface PaymentCardHolderInputsProps {
  firstName: string;
  lastName: string;
  onFirstNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLastNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
}

export const PaymentCardHolderInputs: React.FC<PaymentCardHolderInputsProps> = ({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  error,
  disabled = false,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label
            htmlFor="card_holder_first_name"
            className="text-xs font-semibold text-foreground"
          >
            Kart Üzerindeki İsim (Ad)
          </label>
          <input
            id="card_holder_first_name"
            type="text"
            disabled={disabled}
            value={firstName}
            onChange={onFirstNameChange}
            placeholder="Ad"
            className={`w-full h-10 px-3 rounded-lg border text-sm bg-background outline-none uppercase ${
              error ? 'border-destructive' : 'border-border focus:border-primary'
            }`}
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="card_holder_last_name"
            className="text-xs font-semibold text-foreground"
          >
            Kart Üzerindeki Soyad
          </label>
          <input
            id="card_holder_last_name"
            type="text"
            disabled={disabled}
            value={lastName}
            onChange={onLastNameChange}
            placeholder="Soyad"
            className={`w-full h-10 px-3 rounded-lg border text-sm bg-background outline-none uppercase ${
              error ? 'border-destructive' : 'border-border focus:border-primary'
            }`}
          />
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </>
  );
};
