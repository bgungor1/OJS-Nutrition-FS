import * as React from 'react';
import { ShoppingBag, TrendingUp, MapPin } from 'lucide-react';
import type { AdminUserDetail } from '@/types';

interface UserDetailStatsProps {
  user: AdminUserDetail;
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 flex items-center gap-4">
      <div className="rounded-md bg-muted p-2">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
}

export function UserDetailStats({ user }: UserDetailStatsProps) {
  const totalSpent = user.orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        icon={ShoppingBag}
        label="Toplam Sipariş"
        value={user.orders.length}
      />
      <StatCard
        icon={TrendingUp}
        label="Toplam Harcama"
        value={formatCurrency(totalSpent)}
      />
      <StatCard
        icon={MapPin}
        label="Kayıtlı Adres"
        value={user.addresses.length}
      />
    </div>
  );
}
