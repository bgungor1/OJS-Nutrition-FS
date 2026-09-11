'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from './search-bar';
import { CategoryNav } from './category-nav';
import type { ApiCategory } from '@/types';

interface HeaderProps {
  categories?: ApiCategory[];
}

export const Header: React.FC<HeaderProps> = ({ categories = [] }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-xs">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-black text-2xl tracking-tighter transition-opacity hover:opacity-90 shrink-0"
        >
          <div className="relative h-8 w-28 sm:w-32 hidden sm:block">
            <Image
              src="/LOGO_Siyah.png"
              alt="OJS Nutrition"
              fill
              className="object-contain dark:invert"
              priority
            />
          </div>
          <span className="sm:hidden font-extrabold text-xl">
            OJS <span className="text-primary">NUTRITION</span>
          </span>
        </Link>

        <div className="hidden md:flex flex-1 justify-center max-w-md mx-4">
          <SearchBar />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-foreground hover:text-primary"
            asChild
          >
            <Link href="/login" aria-label="Hesabım">
              <User className="h-5 w-5" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-foreground hover:text-primary"
            asChild
          >
            <Link href="/payment" aria-label="Sepetim">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                0
              </span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="md:hidden rounded-lg"
            aria-label="Menüyü Aç/Kapat"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      <CategoryNav categories={categories} />

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <SearchBar onSearchComplete={closeMobileMenu} />

          <div className="border-t border-border pt-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-2">
              Kategoriler
            </p>
            <CategoryNav
              categories={categories}
              isOpen={true}
              onItemClick={closeMobileMenu}
            />
          </div>

          <div className="border-t border-border pt-3 flex flex-col gap-2 text-sm font-medium">
            <Link
              href="/about"
              onClick={closeMobileMenu}
              className="px-2 py-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              Hakkımızda
            </Link>
            <Link
              href="/faq"
              onClick={closeMobileMenu}
              className="px-2 py-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              Sıkça Sorulan Sorular
            </Link>
            <Link
              href="/contact"
              onClick={closeMobileMenu}
              className="px-2 py-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              İletişim
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
