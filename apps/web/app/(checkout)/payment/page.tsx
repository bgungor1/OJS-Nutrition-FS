import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ödeme',
  description: 'OJS Nutrition güvenli ödeme adımı.',
};

export default function PaymentPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-2">Ödeme Bilgileri</h1>
      <p className="text-sm text-muted-foreground">
        Adres ve güvenli kart ödeme formu Faz 3&apos;te entegre edilecektir.
      </p>
    </div>
  );
}
