import {
  Injectable,
  Logger,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'node:crypto';
import { AuditEvent, SecurityAuditService } from '../common/audit';
import { AppConfig } from '../config/configuration';
import { PrismaService } from '../prisma/prisma.service';
import { TokensResponse } from './interfaces/auth-response.interface';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private static readonly REFRESH_TOKEN_DAYS = 7;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<AppConfig, true>,
    @Optional() private readonly auditService?: SecurityAuditService,
  ) {}

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async generateTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<TokensResponse> {
    const jwtConfig = this.config.get('jwt', { infer: true });

    const [access, refresh] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: jwtConfig.accessSecret,
          expiresIn: jwtConfig.accessExpires as unknown as number,
        },
      ),
      this.jwtService.signAsync(
        { sub: userId },
        {
          secret: jwtConfig.refreshSecret,
          expiresIn: jwtConfig.refreshExpires as unknown as number,
        },
      ),
    ]);

    const expiresAt = new Date(
      Date.now() + TokenService.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
    );
    const tokenHash = this.hashToken(refresh);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return { access, refresh };
  }

  async rotateRefreshToken(
    refreshTokenStr: string,
    ipAddress?: string,
  ): Promise<TokensResponse> {
    const jwtConfig = this.config.get('jwt', { infer: true });

    let payload: { sub: string };
    try {
      payload = await this.jwtService.verifyAsync<{ sub: string }>(
        refreshTokenStr,
        {
          secret: jwtConfig.refreshSecret,
        },
      );
    } catch {
      this.logger.warn(
        `Geçersiz veya süresi dolmuş refresh token sunuldu - IP: ${ipAddress ?? 'bilinmiyor'}`,
      );
      throw new UnauthorizedException(
        'Geçersiz veya süresi dolmuş yenileme anahtarı.',
      );
    }

    const tokenHash = this.hashToken(refreshTokenStr);
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!tokenRecord) {
      this.logger.warn(
        `Veritabanında bulunamayan refresh token denemesi: userId: ${payload.sub} - IP: ${ipAddress ?? 'bilinmiyor'}`,
      );
      throw new UnauthorizedException('Geçersiz yenileme anahtarı.');
    }

    if (tokenRecord.revokedAt !== null) {
      this.logger.warn(
        `GÜVENLİK ALARMI: Token Reuse Attack tespit edildi! Kullanıcı (${tokenRecord.userId}) tüm oturumları iptal ediliyor. - IP: ${ipAddress ?? 'bilinmiyor'}`,
      );
      this.auditService?.alarm(AuditEvent.AUTH_TOKEN_REUSE_DETECTED, {
        ip: ipAddress,
        userId: tokenRecord.userId,
        details: { reason: 'Revoked refresh token presented' },
      });
      await this.prisma.refreshToken.updateMany({
        where: { userId: tokenRecord.userId },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Geçersiz yenileme anahtarı.');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Yenileme anahtarının süresi dolmuş.');
    }

    if (!tokenRecord.user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı.');
    }

    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.generateTokens(
      tokenRecord.user.id,
      tokenRecord.user.email,
      tokenRecord.user.role,
    );

    this.logger.log(
      `Token rotasyonu başarıyla gerçekleştirildi: ${tokenRecord.user.email} (${tokenRecord.user.id}) - IP: ${ipAddress ?? 'bilinmiyor'}`,
    );

    this.auditService?.info(AuditEvent.AUTH_TOKEN_ROTATED, {
      ip: ipAddress,
      userId: tokenRecord.user.id,
      details: { email: tokenRecord.user.email },
    });

    return tokens;
  }

  async revokeRefreshToken(
    refreshTokenStr: string,
    ipAddress?: string,
  ): Promise<void> {
    if (!refreshTokenStr || typeof refreshTokenStr !== 'string') {
      throw new UnauthorizedException('Geçersiz yenileme anahtarı.');
    }

    const tokenHash = this.hashToken(refreshTokenStr);
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!tokenRecord) {
      this.logger.warn(
        `Veritabanında bulunamayan token için logout denemesi - IP: ${ipAddress ?? 'bilinmiyor'}`,
      );
      throw new UnauthorizedException('Geçersiz yenileme anahtarı.');
    }

    if (tokenRecord.revokedAt === null) {
      await this.prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revokedAt: new Date() },
      });
    }

    this.logger.log(
      `Oturum başarıyla sonlandırıldı: userId=${tokenRecord.userId} - IP: ${ipAddress ?? 'bilinmiyor'}`,
    );

    this.auditService?.info(AuditEvent.AUTH_LOGOUT, {
      ip: ipAddress,
      userId: tokenRecord.userId,
      resourceId: tokenRecord.id,
    });
  }

  async revokeAllUserTokens(
    userId: string,
    ipAddress?: string,
    reason?: string,
  ): Promise<number> {
    const result = await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    this.logger.log(
      `Kullanıcının tüm aktif oturumları iptal edildi: userId=${userId} (${result.count} oturum) - IP: ${ipAddress ?? 'bilinmiyor'}`,
    );

    this.auditService?.info(AuditEvent.AUTH_REVOKE_ALL, {
      ip: ipAddress,
      userId,
      details: {
        revokedCount: result.count,
        reason: reason ?? 'USER_REVOKE_ALL',
      },
    });

    return result.count;
  }

  async purgeExpiredTokens(): Promise<number> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { not: null, lt: thirtyDaysAgo } },
        ],
      },
    });

    this.logger.log(
      `Süresi dolmuş/eski token kayıtları temizlendi: ${result.count} adet silindi.`,
    );

    return result.count;
  }
}
