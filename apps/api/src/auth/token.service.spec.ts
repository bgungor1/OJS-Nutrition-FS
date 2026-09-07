import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as crypto from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from './token.service';
import {
  createMockRefreshToken,
  createMockRefreshTokenDto,
  createMockUser,
} from './test/auth.fixture';

describe('TokenService', () => {
  let service: TokenService;
  let prisma: {
    refreshToken: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
  };
  let jwtService: {
    signAsync: jest.Mock;
    verifyAsync: jest.Mock;
  };
  let configService: {
    get: jest.Mock;
  };

  const mockRefreshTokenDto = createMockRefreshTokenDto();

  beforeEach(async () => {
    prisma = {
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    jwtService = {
      signAsync: jest.fn((payload: { role?: string }) => {
        if (payload.role) {
          return Promise.resolve('mock-access-token');
        }
        return Promise.resolve('mock-refresh-token');
      }),
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  describe('generateTokens', () => {
    it('access ve refresh token üretip veritabanına refresh token hash kaydetmeli', async () => {
      prisma.refreshToken.create.mockResolvedValue({ id: 'rt-1' });

      const result = await service.generateTokens(
        'uuid-1234',
        'test@example.com',
        'customer',
      );

      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(prisma.refreshToken.create).toHaveBeenCalledWith({
        data: {
          userId: 'uuid-1234',
          tokenHash: expect.any(String) as unknown as string,
          expiresAt: expect.any(Date) as unknown as Date,
        },
      });
      expect(result).toEqual({
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
      });
    });
  });

  describe('rotateRefreshToken', () => {
    it('geçerli bir refresh token sunulduğunda eski token iptal edilip yeni çift dönmeli', async () => {
      const mockUser = createMockUser();
      const expectedHash = crypto
        .createHash('sha256')
        .update(mockRefreshTokenDto.refresh)
        .digest('hex');
      const mockDbToken = createMockRefreshToken({
        userId: mockUser.id,
        tokenHash: expectedHash,
        user: mockUser,
      });

      jwtService.verifyAsync.mockResolvedValue({ sub: mockUser.id });
      prisma.refreshToken.findUnique.mockResolvedValue(mockDbToken);
      prisma.refreshToken.update.mockResolvedValue({
        ...mockDbToken,
        revokedAt: new Date(),
      });
      prisma.refreshToken.create.mockResolvedValue({ id: 'new-rt-id' });

      const result = await service.rotateRefreshToken(
        mockRefreshTokenDto.refresh,
        '127.0.0.1',
      );

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        mockRefreshTokenDto.refresh,
        {
          secret: 'test-refresh-secret',
        },
      );

      expect(prisma.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { tokenHash: expectedHash },
        include: { user: true },
      });

      // Eski token revoked edilmeli
      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: mockDbToken.id },
        data: { revokedAt: expect.any(Date) as unknown as Date },
      });

      // Yeni token çifti üretilip DB'ye kaydedilmeli
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(prisma.refreshToken.create).toHaveBeenCalled();

      expect(result).toEqual({
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
      });
    });

    it('JWT doğrulaması başarısız olursa UnauthorizedException fırlatmalı', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await expect(
        service.rotateRefreshToken(mockRefreshTokenDto.refresh, '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.rotateRefreshToken(mockRefreshTokenDto.refresh, '127.0.0.1'),
      ).rejects.toThrow('Geçersiz veya süresi dolmuş yenileme anahtarı.');

      expect(prisma.refreshToken.findUnique).not.toHaveBeenCalled();
      expect(prisma.refreshToken.update).not.toHaveBeenCalled();
    });

    it('veritabanında bulunamayan refresh token sunulduğunda UnauthorizedException fırlatmalı', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'uuid-1234' });
      prisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(
        service.rotateRefreshToken(mockRefreshTokenDto.refresh, '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.rotateRefreshToken(mockRefreshTokenDto.refresh, '127.0.0.1'),
      ).rejects.toThrow('Geçersiz yenileme anahtarı.');

      expect(prisma.refreshToken.update).not.toHaveBeenCalled();
    });

    it('TOKEN REUSE ATTACK: daha önce iptal edilmiş token ile denendiğinde kullanıcının tüm oturumlarını iptal etmeli', async () => {
      const mockDbToken = createMockRefreshToken({
        userId: 'uuid-1234',
        revokedAt: new Date(Date.now() - 3600000),
      });

      jwtService.verifyAsync.mockResolvedValue({ sub: 'uuid-1234' });
      prisma.refreshToken.findUnique.mockResolvedValue(mockDbToken);

      await expect(
        service.rotateRefreshToken(mockRefreshTokenDto.refresh, '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.rotateRefreshToken(mockRefreshTokenDto.refresh, '127.0.0.1'),
      ).rejects.toThrow('Geçersiz yenileme anahtarı.');

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'uuid-1234' },
        data: { revokedAt: expect.any(Date) as unknown as Date },
      });
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('süresi dolmuş refresh token sunulduğunda UnauthorizedException fırlatmalı', async () => {
      const mockDbToken = createMockRefreshToken({
        userId: 'uuid-1234',
        expiresAt: new Date(Date.now() - 3600000),
        user: createMockUser(),
      });

      jwtService.verifyAsync.mockResolvedValue({ sub: 'uuid-1234' });
      prisma.refreshToken.findUnique.mockResolvedValue(mockDbToken);

      await expect(
        service.rotateRefreshToken(mockRefreshTokenDto.refresh, '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.rotateRefreshToken(mockRefreshTokenDto.refresh, '127.0.0.1'),
      ).rejects.toThrow('Yenileme anahtarının süresi dolmuş.');

      expect(prisma.refreshToken.update).not.toHaveBeenCalled();
    });
  });
});
