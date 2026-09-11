import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAccessToken } from '@/lib/auth-cookies';
import { getAddresses } from '@/lib/api/addresses';
import { getCountries } from '@/lib/api/locations';
import { AddressList } from '@/components/account/address-list';

export const metadata: Metadata = {
  title: 'Kayıtlı Adreslerim | OJS Nutrition',
  description: 'OJS Nutrition kayıtlı teslimat ve fatura adresleri yönetimi.',
};

export default async function AddressesPage() {
  const token = await getAccessToken();
  if (!token) {
    redirect('/login');
  }

  let addresses = [];
  let countries = [];

  try {
    const [addressesData, countriesData] = await Promise.all([
      getAddresses(token),
      getCountries(),
    ]);
    addresses = addressesData.results ?? [];
    countries = countriesData ?? [];
  } catch {
    redirect('/login');
  }

  return <AddressList addresses={addresses} countries={countries} />;
}
