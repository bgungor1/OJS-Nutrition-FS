import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hesabım',
  description: 'OJS Nutrition kullanıcı hesabı, siparişler ve kayıtlı adresler.',
};

export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Hesabım</h1>
      <p className="text-sm text-muted-foreground">
        Kullanıcı profili, sipariş geçmişi ve adres yönetimi Faz 2&apos;de entegre edilecektir.
      </p>
    </div>
  );
}
