'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, User, Pencil, Trash2, Loader2 } from 'lucide-react';
import type { Address } from '@/types';

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onEdit,
  onDelete,
  isDeleting = false,
}) => {
  const locationLine = [
    address.subregion?.name,
    address.region?.name,
    address.country?.name,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Card className="flex flex-col justify-between border-border shadow-xs hover:border-primary/40 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <Badge variant="outline" className="font-semibold text-xs px-2.5 py-0.5">
          {address.title}
        </Badge>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(address)}
            disabled={isDeleting}
            title="Adresi Düzenle"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Düzenle</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 cursor-pointer text-destructive/70 hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(address.id)}
            disabled={isDeleting}
            title="Adresi Sil"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span className="sr-only">Sil</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <User className="h-4 w-4 text-muted-foreground shrink-0" />
          <span>{address.first_name} {address.last_name}</span>
        </div>
        <div className="flex items-start gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-foreground/90 leading-snug">{address.full_address}</span>
            {locationLine && (
              <span className="text-xs text-muted-foreground mt-0.5">{locationLine}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-4 w-4 shrink-0" />
          <span>{address.phone_number}</span>
        </div>
      </CardContent>
    </Card>
  );
};
