import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Global JwtAuthGuard'ı bu route için devre dışı bırakır.
 * Varsayılan: tüm route'lar korumalı (whitelist yaklaşımı — BACKEND_PLAN §3).
 */
export const Public = (): MethodDecorator & ClassDecorator =>
  SetMetadata(IS_PUBLIC_KEY, true);
