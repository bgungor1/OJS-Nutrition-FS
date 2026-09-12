'use client';

import React, { useActionState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';
import { Button, Input, Textarea } from '@/components/ui';
import { submitContactAction, type ContactActionResult } from '@/app/(shop)/contact/actions';

const initialState: ContactActionResult | null = null;

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactAction, initialState);

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 sm:p-8 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Mesajınız Alındı</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {state.message}
        </p>
        <div className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Yeni Mesaj Gönder
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state && !state.success && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-lg border border-destructive/30 bg-destructive/10 text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="name" className="text-xs font-semibold text-foreground">
          Adınız Soyadınız <span className="text-destructive">*</span>
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Örn: Ahmet Yılmaz"
          required
          aria-invalid={!!state?.errors?.name}
          className="bg-card text-xs sm:text-sm"
        />
        {state?.errors?.name && (
          <p className="text-[11px] text-destructive font-medium">
            {state.errors.name[0]}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-semibold text-foreground">
          E-posta Adresiniz <span className="text-destructive">*</span>
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="ahmet@example.com"
          required
          aria-invalid={!!state?.errors?.email}
          className="bg-card text-xs sm:text-sm"
        />
        {state?.errors?.email && (
          <p className="text-[11px] text-destructive font-medium">
            {state.errors.email[0]}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="message" className="text-xs font-semibold text-foreground">
          Mesajınız <span className="text-destructive">*</span>
        </label>
        <Textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Sorunuzu, sipariş numaranızı veya önerinizi detaylıca yazabilirsiniz..."
          required
          aria-invalid={!!state?.errors?.message}
          className="bg-card text-xs sm:text-sm resize-none"
        />
        {state?.errors?.message && (
          <p className="text-[11px] text-destructive font-medium">
            {state.errors.message[0]}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full sm:w-auto min-w-36 font-semibold"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span>Gönderiliyor...</span>
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            <span>Mesajı Gönder</span>
          </>
        )}
      </Button>
    </form>
  );
}

export default ContactForm;
