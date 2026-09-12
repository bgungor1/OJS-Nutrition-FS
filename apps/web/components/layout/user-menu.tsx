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
        <DropdownMenuItem asChild>
          <form action={logoutAction} className="w-full">
            <button
              type="submit"
              className="w-full text-left cursor-pointer text-destructive flex items-center gap-2 py-0.5"
            >
              <LogOut className="h-4 w-4" />
              <span>Çıkış Yap</span>
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
