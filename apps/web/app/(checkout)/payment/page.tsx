import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAccessToken } from '@/lib/auth-cookies';
import { getAddresses } from '@/lib/api/addresses';
import { getCountries } from '@/lib/api/locations';
import { CheckoutView } from '@/components/checkout';
import type { Address, Country } from '@/types';

export const metadata: Metadata = {
  title: 'Güvenli Ödeme | OJS Nutrition',
  description: 'OJS Nutrition güvenli ödeme ve sipariş tamamlama adımı.',
};

export default async function PaymentPage() {
  const token = await getAccessToken();
  if (!token) {
    redirect('/login?redirect=/payment');
  }

  let addresses: Address[] = [];
  let countries: Country[] = [];

  try {
    const [addressesData, countriesData] = await Promise.all([
      getAddresses(token),
      getCountries(),
    ]);
    addresses = addressesData.results ?? [];
    countries = countriesData ?? [];
  } catch {
    addresses = [];
    countries = [];
  }

  return (
    <div className="py-2">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Ödeme ve Teslimat
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Teslimat adresinizi seçin ve güvenli kart bilgilerinizi girerek siparişinizi tamamlayın.
        </p>
      </div>

      <CheckoutView initialAddresses={addresses} countries={countries} />
    </div>
  );
}
