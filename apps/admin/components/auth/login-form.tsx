'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowRight, Loader2, Lock, Mail } from 'lucide-react';
import { adminLoginAction, type AdminLoginActionState } from '@/app/(auth)/login/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: AdminLoginActionState = { success: false };

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const [state, formAction, isPending] = useActionState(adminLoginAction, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="redirect" value={redirectPath} />

      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
        >
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email">Yönetici E-Postası</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="admin@ojsnutrition.com"
            className="pl-9"
            required
            aria-invalid={Boolean(state.fieldErrors?.email)}
          />
        </div>
        {state.fieldErrors?.email && (
          <p className="text-xs text-destructive">{state.fieldErrors.email}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Şifre</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="pl-9"
            required
            aria-invalid={Boolean(state.fieldErrors?.password)}
          />
        </div>
        {state.fieldErrors?.password && (
          <p className="text-xs text-destructive">{state.fieldErrors.password}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full mt-2 font-medium cursor-pointer"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin mr-1.5" />
            Doğrulanıyor...
          </>
        ) : (
          <>
            Panele Giriş Yap
            <ArrowRight className="size-4 ml-1.5" />
          </>
        )}
      </Button>
    </form>
  );
}
