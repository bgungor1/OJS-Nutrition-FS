'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { useUserRoleUpdate } from './use-user-role-update';
import type { Role } from '@/types';

interface UserRoleDialogProps {
  userId: string;
  currentUserId: string;
  userName: string;
  initialRole: Role;
  trigger?: React.ReactNode;
  onUpdate: (userId: string, role: Role) => Promise<void>;
  onSuccess?: () => void;
}

const ROLE_OPTIONS: Array<{ value: Role; label: string }> = [
  { value: 'customer', label: 'Müşteri' },
  { value: 'admin', label: 'Yönetici' },
];

export function UserRoleDialog({
  userId,
  currentUserId,
  userName,
  initialRole,
  trigger,
  onUpdate,
  onSuccess,
}: UserRoleDialogProps) {
  const {
    isOpen,
    role,
    isSubmitting,
    error,
    isSelfLockout,
    isEscalation,
    setRole,
    handleOpenChange,
    handleSubmit,
  } = useUserRoleUpdate({
    userId,
    currentUserId,
    initialRole,
    onUpdate,
    onSuccess,
  });

  const isDisabled = isSubmitting || isSelfLockout;

  return (
    <>
      {trigger ? (
        <span onClick={() => handleOpenChange(true)} className="inline-block cursor-pointer">
          {trigger}
        </span>
      ) : (
        <Button variant="outline" size="sm" onClick={() => handleOpenChange(true)}>
          Rolü Değiştir
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Kullanıcı Rolünü Güncelle</DialogTitle>
              <DialogDescription>
                <span className="font-semibold text-foreground">{userName}</span> adlı kullanıcının
                sistem rolünü değiştirin.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  {error}
                </div>
              )}

              {isSelfLockout && (
                <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Kendi Hesabınızı Düşüremezsiniz:</span> Kendi
                    admin rolünüzü düşürmek sistem güvenliği açısından engellenmiştir.
                  </div>
                </div>
              )}

              {isEscalation && !isSelfLockout && (
                <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Yetki Yükseltme Uyarısı:</span> Bu kullanıcı
                    yönetim panelindeki tüm verilere erişebilecek ve değişiklik yapabilecektir.
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="user-role-select">Yeni Rol</Label>
                <select
                  id="user-role-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Vazgeç
              </Button>
              <Button type="submit" disabled={isDisabled}>
                {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
