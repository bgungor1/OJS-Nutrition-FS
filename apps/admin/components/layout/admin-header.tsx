'use client';

import * as React from 'react';
import { Menu, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminSidebar } from './admin-sidebar';

interface AdminHeaderProps {
  userEmail?: string;
}

export function AdminHeader({ userEmail }: AdminHeaderProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="h-16 border-b border-border/70 bg-card/60 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3 md:hidden">
        <Button
          variant="outline"
          size="icon"
          className="size-9"
          onClick={() => setMobileOpen(true)}
          aria-label="Menüyü aç"
        >
          <Menu className="size-4" />
        </Button>
        <span className="font-bold text-sm">OJS Admin</span>
      </div>

      <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Sistem Çevrimiçi
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-muted/50 border border-border/50 text-xs">
          <ShieldCheck className="size-3.5 text-primary" />
          <span className="font-medium text-foreground max-w-[160px] truncate">
            {userEmail || 'Yönetici'}
          </span>
          <span className="text-[10px] uppercase font-bold text-primary px-1 bg-primary/10 rounded">
            Admin
          </span>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex flex-col w-64 max-w-[80vw] z-50">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3.5 right-3 size-8 text-sidebar-foreground hover:bg-white/10"
              onClick={() => setMobileOpen(false)}
              aria-label="Menüyü kapat"
            >
              <X className="size-4" />
            </Button>
            <AdminSidebar onNavigate={() => setMobileOpen(false)} className="w-full" />
          </div>
        </div>
      )}
    </header>
  );
}
