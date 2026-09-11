'use client';

import React from 'react';
import Link from 'next/link';
import { User, LogOut } from 'lucide-react';
import { SearchBar } from './search-bar';
import { CategoryNav } from './category-nav';
import { logoutAction } from '@/lib/actions/auth';
import type { AccountProfile, ApiCategory } from '@/types';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ApiCategory[];
  user?: AccountProfile | null;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  categories,
  user,
}) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
      <SearchBar onSearchComplete={onClose} />

      {user ? (
        <div className="border border-border/80 rounded-lg p-3 bg-muted/30">
          <p className="text-sm font-semibold">
            {user.first_name} {user.last_name}
          </p>
          <p className="text-xs text-muted-foreground truncate mb-2">{user.email}</p>
          <div className="flex flex-col gap-1 text-sm pt-2 border-t border-border">
            <Link href="/account" onClick={onClose} className="py-1 text-muted-foreground hover:text-foreground">
              Hesabım
            </Link>
            <Link href="/account/orders" onClick={onClose} className="py-1 text-muted-foreground hover:text-foreground">
              Siparişlerim
            </Link>
            <Link href="/account/addresses" onClick={onClose} className="py-1 text-muted-foreground hover:text-foreground">
              Kayıtlı Adreslerim
            </Link>
            <form action={logoutAction} className="pt-1">
              <button type="submit" className="text-destructive text-sm flex items-center gap-1.5 py-1">
                <LogOut className="h-4 w-4" />
                <span>Çıkış Yap</span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        <Link
          href="/login"
          onClick={onClose}
          className="flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-primary text-primary-foreground font-semibold text-sm"
        >
          <User className="h-4 w-4" />
          <span>Giriş Yap / Kayıt Ol</span>
        </Link>
      )}

      <div className="border-t border-border pt-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-2">
          Kategoriler
        </p>
        <CategoryNav categories={categories} isOpen={true} onItemClick={onClose} />
      </div>

      <div className="border-t border-border pt-3 flex flex-col gap-2 text-sm font-medium">
        <Link
          href="/about"
          onClick={onClose}
          className="px-2 py-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          Hakkımızda
        </Link>
        <Link
          href="/faq"
          onClick={onClose}
          className="px-2 py-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          Sıkça Sorulan Sorular
        </Link>
        <Link
          href="/contact"
          onClick={onClose}
          className="px-2 py-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          İletişim
        </Link>
      </div>
    </div>
  );
};
