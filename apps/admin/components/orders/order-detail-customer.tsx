import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { User, Mail, Phone, ExternalLink } from 'lucide-react';
import type { AdminOrderCustomer } from '@/types';

interface OrderDetailCustomerProps {
  customer: AdminOrderCustomer;
}

export function OrderDetailCustomer({ customer }: OrderDetailCustomerProps) {
  const customerName = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'İsimsiz Müşteri';

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base font-semibold">Müşteri Bilgileri</CardTitle>
        </div>
        <Link
          href={`/users/${customer.id}`}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          <span>Profil</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <span className="text-xs text-muted-foreground block">Ad Soyad</span>
          <span className="font-medium text-foreground">{customerName}</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-foreground">{customer.email}</span>
        </div>

        {customer.phoneNumber && (
          <div className="flex items-center gap-2 text-xs">
            <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-foreground">{customer.phoneNumber}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
