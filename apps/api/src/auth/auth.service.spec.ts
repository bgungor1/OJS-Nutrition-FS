import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthProvider } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import {
  createMockLoginDto,
  createMockRefreshTokenDto,
  createMockRegisterDto,
  createMockSafeUser,
  createMockUser,
} from './test/auth.fixture';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };
  let tokenService: {
    generateTokens: jest.Mock;
    rotateRefreshToken: jest.Mock;
  };

  const mockRegisterDto = createMockRegisterDto();
  const mockLoginDto = createMockLoginDto();
  const mockRefreshTokenDto = createMockRefreshTokenDto();

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    tokenService = {
      generateTokens: jest.fn().mockResolvedValue({
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
      }),
      rotateRefreshToken: jest.fn().mockResolvedValue({
        access: 'mock-rotated-access-token',
        refresh: 'mock-rotated-refresh-token',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: TokenService, useValue: tokenService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('Faz 1.3.1 (Register)', () => {
    it('şifreler eşleşmediğinde BadRequestException fırlatmalı', async () => {
      const invalidDto = {
        ...mockRegisterDto,
        password2: 'FarkliSifre2',
      };

      await expect(service.register(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.register(invalidDto)).rejects.toThrow(
        'Şifreler eşleşmiyor.',
      );
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('e-posta zaten kayıtlıysa ConflictException fırlatmalı', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        'Bu e-posta adresi zaten kullanımda.',
      );
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: { id: true },
      });
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('geçerli verilerle kullanıcıyı başarıyla kaydetmeli ve şifreyi hashlemeli', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const createdUser = createMockSafeUser();
      prisma.user.create.mockResolvedValue(createdUser);

      const result = await service.register(mockRegisterDto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: { id: true },
      });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          passwordHash: expect.stringMatching(
            /^\$2[abxy]?\$\d+\$/,
          ) as unknown as string,
          firstName: 'Test',
          lastName: 'User',
          authProvider: 'local',
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
      });

      const createCalls = prisma.user.create.mock.calls as Array<
        [
          {
            data: {
              email: string;
              passwordHash: string;
              firstName: string;
              lastName: string;
              authProvider: string;
            };
          },
        ]
      >;
      const passedData = createCalls[0]?.[0]?.data;
      expect(passedData).toBeDefined();
      const isPasswordValid = await bcrypt.compare(
        mockRegisterDto.password,
        passedData?.passwordHash ?? '',
      );
      expect(isPasswordValid).toBe(true);

      expect(result).toEqual({
        user: createdUser,
        message: 'Kayıt başarıyla tamamlandı.',
      });
      expect(
        (result.user as unknown as Record<string, unknown>).passwordHash,
      ).toBeUndefined();
    });
  });

  describe('Faz 1.3.2 (Login)', () => {
    it('doğru bilgilerle giriş yapıldığında tokenService.generateTokens çağrılmalı', async () => {
      const rawPassword = 'Password1';
      const passwordHash = await bcrypt.hash(rawPassword, 10);
      const mockUser = createMockUser({ passwordHash });

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.login(mockLoginDto, '127.0.0.1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockLoginDto.username },
      });

      expect(tokenService.generateTokens).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.email,
        mockUser.role,
      );

      expect(result).toEqual({
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
      });
    });

    it('kullanıcı bulunamadığında genel UnauthorizedException fırlatmalı (user enumeration engeli)', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(mockLoginDto, '127.0.0.1')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(mockLoginDto, '127.0.0.1')).rejects.toThrow(
        'Geçersiz e-posta veya şifre.',
      );

      expect(tokenService.generateTokens).not.toHaveBeenCalled();
    });

    it('kullanıcı sağlayıcısı local değilse genel UnauthorizedException fırlatmalı', async () => {
      const googleUser = createMockUser({
        authProvider: AuthProvider.google,
        passwordHash: null,
      });
      prisma.user.findUnique.mockResolvedValue(googleUser);

      await expect(service.login(mockLoginDto, '127.0.0.1')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(mockLoginDto, '127.0.0.1')).rejects.toThrow(
        'Geçersiz e-posta veya şifre.',
      );

      expect(tokenService.generateTokens).not.toHaveBeenCalled();
    });

    it('hatalı şifre girildiğinde genel UnauthorizedException fırlatmalı', async () => {
      const correctHash = await bcrypt.hash('FarkliSifre999', 10);
      const mockUser = createMockUser({ passwordHash: correctHash });
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.login(mockLoginDto, '127.0.0.1')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(mockLoginDto, '127.0.0.1')).rejects.toThrow(
        'Geçersiz e-posta veya şifre.',
      );

      expect(tokenService.generateTokens).not.toHaveBeenCalled();
    });
  });

  describe('Faz 1.3.3 (RefreshToken)', () => {
    it('refreshToken isteğini tokenService.rotateRefreshToken metoduna delege etmeli', async () => {
      const result = await service.refreshToken(
        mockRefreshTokenDto,
        '127.0.0.1',
      );

      expect(tokenService.rotateRefreshToken).toHaveBeenCalledWith(
        mockRefreshTokenDto.refresh,
        '127.0.0.1',
      );

      expect(result).toEqual({
        access: 'mock-rotated-access-token',
        refresh: 'mock-rotated-refresh-token',
      });
    });
  });
});
