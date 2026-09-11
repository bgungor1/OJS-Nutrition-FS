'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { AddressCard } from './address-card';
import { AddressModal } from './address-modal';
import { deleteAddressAction } from '@/app/(shop)/account/addresses/actions';
import { Plus, MapPin, AlertCircle } from 'lucide-react';
import type { Address, Country } from '@/types';

interface AddressListProps {
  addresses: Address[];
  countries: Country[];
}

export const AddressList: React.FC<AddressListProps> = ({
  addresses,
  countries,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleOpenCreate = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (address: Address) => {
    setEditingAddress(address);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Bu adresi silmek istediğinize emin misiniz?')) return;
    setDeleteError(null);
    setDeletingId(id);

    startTransition(async () => {
      const res = await deleteAddressAction(id);
      setDeletingId(null);
      if (!res.success) {
        setDeleteError(res.error || 'Adres silinemedi.');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kayıtlı Adreslerim</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Teslimat ve fatura adreslerinizi görüntüleyin ve düzenleyin.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 cursor-pointer shrink-0">
          <Plus className="h-4 w-4" />
          <span>Yeni Adres Ekle</span>
        </Button>
      </div>

      {deleteError && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{deleteError}</span>
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-card/50">
          <div className="p-4 bg-muted rounded-full mb-3 text-muted-foreground">
            <MapPin className="h-8 w-8" />
          </div>
          <h3 className="font-semibold text-lg">Kayıtlı adresiniz bulunamadı</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-5">
            Henüz kayıtlı bir adresiniz yok. Alışverişlerinizi kolaylaştırmak için hemen bir adres ekleyin.
          </p>
          <Button onClick={handleOpenCreate} className="gap-2 cursor-pointer">
            <Plus className="h-4 w-4" />
            <span>İlk Adresinizi Ekleyin</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              isDeleting={deletingId === address.id}
            />
          ))}
        </div>
      )}

      <AddressModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editingAddress}
        countries={countries}
      />
    </div>
  );
};
