'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Mail,
  Package,
  Shield,
  ShoppingBag,
  Store,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminLogoutAction } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';

export const ADMIN_NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Ürünler', icon: Package },
  { href: '/orders', label: 'Siparişler', icon: ShoppingBag },
  { href: '/users', label: 'Kullanıcılar', icon: Users },
  { href: '/faq', label: 'SSS Yönetimi', icon: HelpCircle },
  { href: '/contact', label: 'İletişim', icon: Mail },
];

interface AdminSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function AdminSidebar({ className, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3000';

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'flex flex-col w-64 bg-sidebar border-r border-sidebar-border h-screen shrink-0',
        className,
      )}
    >
      <div className="h-16 flex items-center gap-3 px-5 border-b border-sidebar-border">
        <div className="size-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
          <Shield className="size-4" />
        </div>
        <div>
          <div className="font-bold text-sm tracking-tight text-sidebar-foreground">
            OJS Nutrition
          </div>
          <div className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
            Yönetici Portalı
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
          Yönetim Menüsü
        </div>
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActiveRoute(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                  : 'text-sidebar-foreground/75 hover:bg-white/5 hover:text-sidebar-foreground',
              )}
            >
              <Icon className={cn('size-4 shrink-0', active ? 'text-primary-foreground' : 'text-muted-foreground')} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-2">
        <a
          href={storefrontUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-sidebar-foreground/70 hover:bg-white/5 hover:text-sidebar-foreground transition-colors"
        >
          <Store className="size-4 text-muted-foreground" />
          <span>Müşteri Mağazası</span>
          <span className="ml-auto text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono">↗</span>
        </a>

        <form action={adminLogoutAction}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs text-destructive hover:bg-destructive/10 hover:text-destructive h-9 px-3 gap-2.5"
          >
            <LogOut className="size-4" />
            <span>Oturumu Kapat</span>
          </Button>
        </form>
      </div>
    </aside>
  );
}
