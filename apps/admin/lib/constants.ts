export const ACCESS_TOKEN_COOKIE = 'ojs_access_token';
export const REFRESH_TOKEN_COOKIE = 'ojs_refresh_token';

export const ACCESS_TOKEN_MAX_AGE = 15 * 60;
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

export const AUTH_ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
} as const;

export const ADMIN_NAV_LINKS = [
  { href: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/products', label: 'Ürünler', icon: 'Package' },
  { href: '/orders', label: 'Siparişler', icon: 'ShoppingBag' },
  { href: '/users', label: 'Kullanıcılar', icon: 'Users' },
  { href: '/faq', label: 'SSS Yönetimi', icon: 'HelpCircle' },
  { href: '/contact', label: 'İletişim Mesajları', icon: 'Mail' },
] as const;
