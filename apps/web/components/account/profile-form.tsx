'use client';

import React, { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { updateProfileAction, type ProfileActionState } from '@/app/(shop)/account/actions';
import { Loader2, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import type { AccountProfile } from '@/types';

interface ProfileFormProps {
  initialData: AccountProfile;
}

const initialState: ProfileActionState = { success: false };

export const ProfileForm: React.FC<ProfileFormProps> = ({ initialData }) => {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

  return (
    <Card className="shadow-xs border-border">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Kişisel Bilgiler</CardTitle>
        <CardDescription>
          Hesabınıza ait kişisel bilgilerinizi buradan görüntüleyebilir ve güncelleyebilirsiniz.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-6">
          {state.success && state.message && (
            <div className="flex items-center gap-2 p-3.5 text-sm text-green-700 bg-green-50 dark:bg-green-950/30 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-900 animate-in fade-in-50">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{state.message}</span>
            </div>
          )}

          {state.error && (
            <div className="flex items-center gap-2 p-3.5 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20 animate-in fade-in-50">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="first_name">Ad</Label>
              <Input
                id="first_name"
                name="first_name"
                defaultValue={initialData.first_name}
                required
                aria-invalid={Boolean(state.fieldErrors?.first_name)}
              />
              {state.fieldErrors?.first_name && (
                <p className="text-xs text-destructive">{state.fieldErrors.first_name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="last_name">Soyad</Label>
              <Input
                id="last_name"
                name="last_name"
                defaultValue={initialData.last_name}
                required
                aria-invalid={Boolean(state.fieldErrors?.last_name)}
              />
              {state.fieldErrors?.last_name && (
                <p className="text-xs text-destructive">{state.fieldErrors.last_name}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="email">E-posta Adresi</Label>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                  <Lock className="h-3 w-3" /> Değiştirilemez
                </span>
              </div>
              <Input
                id="email"
                type="email"
                defaultValue={initialData.email}
                disabled
                className="bg-muted/50 text-muted-foreground cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone_number">Telefon Numarası</Label>
              <Input
                id="phone_number"
                name="phone_number"
                type="tel"
                placeholder="+905551234567"
                defaultValue={initialData.phone_number || ''}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              className="font-semibold px-6 cursor-pointer"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                'Değişiklikleri Kaydet'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
