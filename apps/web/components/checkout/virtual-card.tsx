'use client';

import React from 'react';
import { Wifi } from 'lucide-react';
import { detectCardBrand, formatCardNumber } from '@/lib/utils/card';

interface VirtualCardProps {
  cardNumber?: string;
  cardHolder?: string;
  expireMonth?: string;
  expireYear?: string;
}

export const VirtualCard: React.FC<VirtualCardProps> = ({
  cardNumber = '',
  cardHolder = '',
  expireMonth = '',
  expireYear = '',
}) => {
  const brand = detectCardBrand(cardNumber);
  const formattedNumber = formatCardNumber(cardNumber);
  const displayHolder = (cardHolder.trim() || 'AD SOYAD').toUpperCase();

  const displayExpiry =
    expireMonth || expireYear
      ? `${expireMonth.padStart(2, '•')}/${(expireYear || '••').slice(-2)}`
      : '••/••';

  const brandLabels: Record<string, string> = {
    visa: 'VISA',
    mastercard: 'Mastercard',
    troy: 'TROY',
    amex: 'AMEX',
    unknown: '',
  };

  return (
    <div className="relative w-full max-w-sm mx-auto aspect-[1.586/1] rounded-2xl bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-800 p-5 sm:p-6 text-white shadow-2xl border border-zinc-700/60 overflow-hidden flex flex-col justify-between select-none">
      <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-primary/15 blur-2xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-7 rounded-sm bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-inner flex items-center justify-center border border-amber-300/40">
            <div className="w-7 h-5 border border-amber-800/40 rounded-xs grid grid-cols-2 grid-rows-2" />
          </div>
          <Wifi className="h-5 w-5 text-zinc-400 rotate-90" />
        </div>
        <div className="text-right">
          <span className="text-sm font-black tracking-widest text-primary italic">
            OJS
          </span>
          <span className="text-sm font-light text-zinc-300"> NUTRITION</span>
        </div>
      </div>

      <div className="relative my-auto pt-2">
        <div className="font-mono text-base sm:text-lg tracking-widest font-semibold text-zinc-100 drop-shadow-xs">
          {formattedNumber || '•••• •••• •••• ••••'}
        </div>
      </div>

      <div className="relative flex items-end justify-between text-xs">
        <div className="min-w-0 pr-4">
          <span className="block text-[9px] uppercase tracking-wider text-zinc-400">
            Kart Sahibi
          </span>
          <span className="block font-medium tracking-wide truncate uppercase text-zinc-100">
            {displayHolder}
          </span>
        </div>

        <div className="flex items-end gap-4 shrink-0">
          <div>
            <span className="block text-[9px] uppercase tracking-wider text-zinc-400">
              SKT
            </span>
            <span className="block font-mono font-medium text-zinc-100">
              {displayExpiry}
            </span>
          </div>

          <div className="h-6 min-w-12 flex items-center justify-end font-bold text-sm text-zinc-200">
            {brandLabels[brand] || ''}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualCard;
