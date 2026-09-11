import React from 'react';
import { AccountNav } from '@/components/account/account-nav';

export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-6xl">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <AccountNav />
        <div className="flex-1 w-full min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
