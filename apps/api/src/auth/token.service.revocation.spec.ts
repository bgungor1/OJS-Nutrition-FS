import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuditEvent, SecurityAuditService } from '../common/audit';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from './token.service';
import { createMockRefreshToken } from './test/auth.fixture';

describe('TokenService (Revocation & Purge Lifecycle)', () => {
  let service: TokenService;
  let prisma: {
    refreshToken: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      deleteMany: jest.Mock;
    };
  };
  let jwtService: {
    signAsync: jest.Mock;
    verifyAsync: jest.Mock;
  };
  let configService: {
    get: jest.Mock;
  };
  let auditService: {
    record: jest.Mock;
    info: jest.Mock;
    warn: jest.Mock;
    alarm: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    configService = {
      get: jest.fn((key: string) => {
        if (key === 'jwt') {
          return {
            accessSecret: 'test-access-secret',
            refreshSecret: 'test-refresh-secret',
            accessExpires: '15m',
            refreshExpires: '7d',
          };
        }
        return undefined;
      }),
    };

    auditService = {
      record: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      alarm: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: SecurityAuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  describe('revokeRefreshToken', () => {
    it('geçerli refresh token sunulduğunda revokedAt tarihini güncellemeli ve AUTH_LOGOUT loglamalı', async () => {
      const mockDbToken = createMockRefreshToken({
        id: 'token-123',
        userId: 'user-abc',
        revokedAt: null,
      });

      prisma.refreshToken.findUnique.mockResolvedValue(mockDbToken);
      prisma.refreshToken.update.mockResolvedValue({
        ...mockDbToken,
        revokedAt: new Date(),
      });

      await service.revokeRefreshToken('valid-refresh-token', '192.168.1.1');

      expect(prisma.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { tokenHash: service.hashToken('valid-refresh-token') },
      });
      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 'token-123' },
        data: { revokedAt: expect.any(Date) as unknown as Date },
      });
      expect(auditService.info).toHaveBeenCalledWith(
        AuditEvent.AUTH_LOGOUT,
        expect.objectContaining({
          userId: 'user-abc',
          ip: '192.168.1.1',
          resourceId: 'token-123',
        }),
      );
    });

    it('zaten iptal edilmiş token sunulduğunda idempotent davranmalı (tekrar update yapmamalı)', async () => {
      const mockDbToken = createMockRefreshToken({
        id: 'token-123',
        userId: 'user-abc',
        revokedAt: new Date(Date.now() - 60000),
      });

      prisma.refreshToken.findUnique.mockResolvedValue(mockDbToken);

      await service.revokeRefreshToken('already-revoked-token', '192.168.1.1');

      expect(prisma.refreshToken.update).not.toHaveBeenCalled();
      expect(auditService.info).toHaveBeenCalledWith(
        AuditEvent.AUTH_LOGOUT,
        expect.objectContaining({
          userId: 'user-abc',
          ip: '192.168.1.1',
        }),
      );
    });

    it('veritabanında bulunmayan token için UnauthorizedException fırlatmalı', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(
        service.revokeRefreshToken('nonexistent-token', '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.revokeRefreshToken('nonexistent-token', '127.0.0.1'),
      ).rejects.toThrow('Geçersiz yenileme anahtarı.');
    });

    it('boş token sunulduğunda UnauthorizedException fırlatmalı', async () => {
      await expect(service.revokeRefreshToken('')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('revokeAllUserTokens', () => {
    it('kullanıcının tüm aktif oturumlarını iptal etmeli ve AUTH_REVOKE_ALL loglamalı', async () => {
      prisma.refreshToken.updateMany.mockResolvedValue({ count: 3 });

      const count = await service.revokeAllUserTokens(
        'user-abc',
        '10.0.0.1',
        'PASSWORD_CHANGED',
      );

      expect(count).toBe(3);
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-abc',
          revokedAt: null,
        },
        data: {
          revokedAt: expect.any(Date) as unknown as Date,
        },
      });
      expect(auditService.info).toHaveBeenCalledWith(
        AuditEvent.AUTH_REVOKE_ALL,
        expect.objectContaining({
          userId: 'user-abc',
          ip: '10.0.0.1',
          details: {
            revokedCount: 3,
            reason: 'PASSWORD_CHANGED',
          },
        }),
      );
    });
  });

  describe('purgeExpiredTokens', () => {
    it('süresi dolmuş veya 30 günden eski iptal edilmiş token kayıtlarını silmeli', async () => {
      prisma.refreshToken.deleteMany.mockResolvedValue({ count: 12 });

      const deletedCount = await service.purgeExpiredTokens();

      expect(deletedCount).toBe(12);
      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { expiresAt: { lt: expect.any(Date) as unknown as Date } },
            {
              revokedAt: {
                not: null,
                lt: expect.any(Date) as unknown as Date,
              },
            },
          ],
        },
      });
    });
  });
});
