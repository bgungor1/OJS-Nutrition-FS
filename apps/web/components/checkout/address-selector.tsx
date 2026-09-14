'use client';

import React from 'react';
import { MapPin, Plus, Check, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Address } from '@/types';

interface AddressSelectorProps {
  addresses: Address[];
  selectedAddressId: string;
  onSelectAddressId: (id: string) => void;
  onOpenNewAddressModal: () => void;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  addresses,
  selectedAddressId,
  onSelectAddressId,
  onOpenNewAddressModal,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">Teslimat Adresi</h2>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenNewAddressModal}
          className="text-xs font-semibold gap-1.5 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          Yeni Adres
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-center space-y-3 bg-card/50">
          <p className="text-sm text-muted-foreground">
            Kayıtlı teslimat adresiniz bulunmuyor. Sipariş verebilmek için lütfen yeni bir adres ekleyin.
          </p>
          <Button
            type="button"
            onClick={onOpenNewAddressModal}
            className="font-semibold gap-1.5 cursor-pointer"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Adres Ekle
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {addresses.map((address) => {
            const isSelected = address.id === selectedAddressId;
            return (
              <div
                key={address.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => onSelectAddressId(address.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectAddressId(address.id);
                  }
                }}
                className={`relative rounded-xl border p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-xs'
                    : 'border-border bg-card hover:border-border/80 hover:bg-muted/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-bold text-sm text-foreground block truncate">
                      {address.title}
                    </span>
                    <span className="text-xs font-medium text-foreground block mt-0.5">
                      {address.first_name} {address.last_name}
                    </span>
                  </div>

                  <div
                    className={`h-5 w-5 rounded-full flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-border bg-background'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </div>

                <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {address.full_address}
                </p>

                <div className="mt-3 pt-2 border-t border-border/50 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>{address.phone_number}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AddressSelector;
