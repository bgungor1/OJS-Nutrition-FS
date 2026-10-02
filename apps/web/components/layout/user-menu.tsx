'use client';

import React from 'react';
import Link from 'next/link';
import { User, LogOut } from 'lucide-react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import { logoutAction } from '@/lib/actions/auth';
import type { AccountProfile } from '@/types';

interface UserMenuProps {
  user?: AccountProfile | null;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const [isLoggingOut, startTransition] = React.useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await logoutAction();
      } catch (err: unknown) {
        if (
          typeof err === 'object' &&
          err !== null &&
          'digest' in err &&
          typeof (err as { digest: unknown }).digest === 'string' &&
          (err as { digest: string }).digest.startsWith('NEXT_REDIRECT')
        ) {
          throw err;
        }
        console.error('Logout error:', err);
      }
    });
  };

  if (!user) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full text-foreground hover:text-primary"
        asChild
      >
        <Link href="/login" aria-label="Giriş Yap">
          <User className="h-5 w-5" />
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-foreground hover:text-primary relative"
          aria-label="Kullanıcı Menüsü"
        >
          <User className="h-5 w-5 text-primary" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-semibold leading-none">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.role === 'admin' && (
          <>
            <DropdownMenuItem asChild>
              <a
                href={process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002'}
                className="w-full cursor-pointer font-semibold text-primary flex items-center justify-between py-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Yönetici Paneli</span>
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono font-bold">
                  Admin ↗
                </span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem asChild>
          <Link href="/account" className="w-full cursor-pointer">
            Hesabım
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/orders" className="w-full cursor-pointer">
            Siparişlerim
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/addresses" className="w-full cursor-pointer">
            Kayıtlı Adreslerim
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            handleLogout();
          }}
          disabled={isLoggingOut}
          className="w-full cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 flex items-center gap-2 py-1.5"
        >
          <LogOut className="h-4 w-4" />
          <span>{isLoggingOut ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
