'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Package, MapPin, LogOut } from 'lucide-react';
import { logoutAction } from '@/lib/actions/auth';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/account', label: 'Hesap Bilgilerim', icon: User },
  { href: '/account/orders', label: 'Siparişlerim', icon: Package },
  { href: '/account/addresses', label: 'Kayıtlı Adreslerim', icon: MapPin },
];

export const AccountNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <h2 className="text-lg font-bold tracking-tight mb-4 px-2">Hesap Yönetimi</h2>

        <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-2 mt-2 border-t border-border hidden lg:block">
            <form action={logoutAction} className="w-full">
              <button
                type="submit"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full text-left cursor-pointer"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Çıkış Yap</span>
              </button>
            </form>
          </div>
        </nav>
      </div>
    </aside>
  );
};
