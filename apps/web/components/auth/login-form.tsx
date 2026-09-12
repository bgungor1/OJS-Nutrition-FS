'use client';

import React, { useActionState } from 'react';
import { Button, Input, Label } from '@/components/ui';
import { loginAction, type AuthActionState } from '@/app/(shop)/login/actions';
import { Loader2 } from 'lucide-react';

interface LoginFormProps {
  redirectTo?: string;
}

const initialState: AuthActionState = { success: false };

export const LoginForm: React.FC<LoginFormProps> = ({ redirectTo = '/account' }) => {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirect" value={redirectTo} />

      {state.error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
          {state.error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="login-email">E-posta Adresi</Label>
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="ornek@domain.com"
          required
          aria-invalid={Boolean(state.fieldErrors?.email)}
        />
        {state.fieldErrors?.email && (
          <p className="text-xs text-destructive">{state.fieldErrors.email}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="login-password">Şifre</Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          aria-invalid={Boolean(state.fieldErrors?.password)}
        />
        {state.fieldErrors?.password && (
          <p className="text-xs text-destructive">{state.fieldErrors.password}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full font-semibold cursor-pointer"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Giriş Yapılıyor...
          </>
        ) : (
          'Giriş Yap'
        )}
      </Button>
    </form>
  );
};
