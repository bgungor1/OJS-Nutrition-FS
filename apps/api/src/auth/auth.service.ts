import { Injectable } from '@nestjs/common';

/**
 * Faz 1 — BACKEND_PLAN §5.1:
 *  - register(dto): bcrypt hash, User oluştur, {access, refresh} üret
 *  - login(dto): authProvider === 'local' için şifre kontrolü
 *  - refresh(token): RefreshToken.tokenHash eşleşmesi + rotation
 *  - google OAuth: googleId / e-posta eşleştirme
 */
@Injectable()
export class AuthService {}
