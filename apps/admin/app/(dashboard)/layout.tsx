import * as React from 'react';
import { getAccessToken } from '@/lib/auth-cookies';
import { decodeJwtPayload } from '@/lib/jwt';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminHeader } from '@/components/layout/admin-header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userEmail: string | undefined;

  try {
    const token = await getAccessToken();
    if (token) {
      const payload = decodeJwtPayload(token);
      userEmail = payload?.email;
    }
  } catch {
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar className="hidden md:flex sticky top-0" />

      <div className="flex flex-col flex-1 min-w-0">
        <AdminHeader userEmail={userEmail} />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
