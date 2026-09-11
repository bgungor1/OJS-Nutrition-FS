import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/auth-card';

export const metadata: Metadata = {
  title: 'Giriş Yap / Kayıt Ol | OJS Nutrition',
  description: 'OJS Nutrition kullanıcı hesabınıza giriş yapın veya yeni bir hesap oluşturun.',
};

interface LoginPageProps {
  searchParams: Promise<{
    redirect?: string;
    tab?: 'login' | 'register';
    error?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo = params.redirect || '/account';
  const defaultTab = params.tab === 'register' ? 'register' : 'login';

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 flex items-center justify-center min-h-[calc(100vh-16rem)]">
      <AuthCard redirectTo={redirectTo} defaultTab={defaultTab} />
    </div>
  );
}
