import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  GoogleProfile,
  TokensResponse,
} from './interfaces/auth-response.interface';
import { TokenService } from './token.service';

@Injectable()
export class GoogleAuthService {
  private readonly logger = new Logger(GoogleAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async validateOrCreateGoogleUser(
    profile: GoogleProfile,
  ): Promise<TokensResponse> {
    let user = await this.prisma.user.findUnique({
      where: { googleId: profile.googleId },
    });

    if (!user) {
      const existingByEmail = await this.prisma.user.findUnique({
        where: { email: profile.email },
      });

      if (existingByEmail) {
        if (existingByEmail.authProvider === 'local') {
          throw new ConflictException(
            'Bu e-posta adresi yerel şifre ile kayıtlıdır. Lütfen şifrenizle giriş yapınız.',
          );
        }
        user = await this.prisma.user.update({
          where: { id: existingByEmail.id },
          data: { googleId: profile.googleId },
        });
      } else {
        user = await this.prisma.user.create({
          data: {
            email: profile.email,
            googleId: profile.googleId,
            authProvider: 'google',
            firstName: profile.firstName ?? 'Google',
            lastName: profile.lastName ?? 'Kullanıcısı',
            passwordHash: null,
          },
        });
        this.logger.log(
          `Google OAuth ile yeni kullanıcı oluşturuldu: ${user.email} (${user.id})`,
        );
      }
    }

    return this.tokenService.generateTokens(user.id, user.email, user.role);
  }
}
