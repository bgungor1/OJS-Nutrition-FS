import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Siparişiniz Alındı',
  description: 'OJS Nutrition sipariş onay sayfası.',
};

export default function ThankYouPage() {
  return (
    <div className="max-w-xl mx-auto py-12 text-center space-y-4">
      <span className="text-5xl">🎉</span>
      <h1 className="text-3xl font-bold tracking-tight">Siparişiniz Alındı!</h1>
      <p className="text-sm text-muted-foreground">
        Sipariş detaylarınız ve kargo takip numarası e-posta adresinize iletilecektir.
      </p>
    </div>
  );
}
