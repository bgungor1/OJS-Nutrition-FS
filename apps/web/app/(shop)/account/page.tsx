import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAccessToken } from '@/lib/auth-cookies';
import { getMyAccount } from '@/lib/api/users';
import { ProfileForm } from '@/components/account/profile-form';

export const metadata: Metadata = {
  title: 'Hesap Bilgilerim | OJS Nutrition',
  description: 'OJS Nutrition kullanıcı hesabı ve kişisel profil bilgileri.',
};

export default async function AccountPage() {
  const token = await getAccessToken();
  if (!token) {
    redirect('/login');
  }

  let account;
  try {
    account = await getMyAccount(token);
  } catch {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <ProfileForm initialData={account} />
    </div>
  );
}
