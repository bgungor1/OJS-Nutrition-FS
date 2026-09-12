'use client';

import React, { useActionState } from 'react';
import { Button, Input, Label } from '@/components/ui';
import { registerAction, type AuthActionState } from '@/app/(shop)/login/actions';
import { Loader2 } from 'lucide-react';

interface RegisterFormProps {
  redirectTo?: string;
}

const initialState: AuthActionState = { success: false };

export const RegisterForm: React.FC<RegisterFormProps> = ({ redirectTo = '/account' }) => {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirect" value={redirectTo} />

      {state.error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="register-first-name">Ad</Label>
          <Input
            id="register-first-name"
            name="first_name"
            autoComplete="given-name"
            placeholder="Adınız"
            required
            aria-invalid={Boolean(state.fieldErrors?.first_name)}
          />
          {state.fieldErrors?.first_name && (
            <p className="text-xs text-destructive">{state.fieldErrors.first_name}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="register-last-name">Soyad</Label>
          <Input
            id="register-last-name"
            name="last_name"
            autoComplete="family-name"
            placeholder="Soyadınız"
            required
            aria-invalid={Boolean(state.fieldErrors?.last_name)}
          />
          {state.fieldErrors?.last_name && (
            <p className="text-xs text-destructive">{state.fieldErrors.last_name}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="register-email">E-posta Adresi</Label>
        <Input
          id="register-email"
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
        <Label htmlFor="register-password">Şifre</Label>
        <Input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="En az 8 karakter"
          required
          aria-invalid={Boolean(state.fieldErrors?.password)}
        />
        {state.fieldErrors?.password && (
          <p className="text-xs text-destructive">{state.fieldErrors.password}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="register-password2">Şifre Tekrarı</Label>
        <Input
          id="register-password2"
          name="password2"
          type="password"
          autoComplete="new-password"
          placeholder="Şifrenizi tekrar giriniz"
          required
          aria-invalid={Boolean(state.fieldErrors?.password2)}
        />
        {state.fieldErrors?.password2 && (
          <p className="text-xs text-destructive">{state.fieldErrors.password2}</p>
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
            Kayıt Yapılıyor...
          </>
        ) : (
          'Kayıt Ol'
        )}
      </Button>
    </form>
  );
};
