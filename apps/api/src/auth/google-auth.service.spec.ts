import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthProvider } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleAuthService } from './google-auth.service';
import { TokenService } from './token.service';
import { createMockUser } from './test/auth.fixture';

describe('GoogleAuthService', () => {
  let service: GoogleAuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };
  let tokenService: {
    generateTokens: jest.Mock;
  };

  const mockGoogleProfile = {
    googleId: 'google-123456',
    email: 'googleuser@example.com',
    firstName: 'Google',
    lastName: 'User',
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    tokenService = {
      generateTokens: jest.fn().mockResolvedValue({
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleAuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: TokenService, useValue: tokenService },
      ],
    }).compile();

    service = module.get<GoogleAuthService>(GoogleAuthService);
  });

  describe('validateOrCreateGoogleUser', () => {
    it('mevcut google kullanıcısı googleId ile bulunduğunda token üretmeli', async () => {
      const existingGoogleUser = createMockUser({
        googleId: 'google-123456',
        authProvider: AuthProvider.google,
        passwordHash: null,
      });
      prisma.user.findUnique.mockResolvedValue(existingGoogleUser);

      const result =
        await service.validateOrCreateGoogleUser(mockGoogleProfile);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { googleId: 'google-123456' },
      });
      expect(tokenService.generateTokens).toHaveBeenCalledWith(
        existingGoogleUser.id,
        existingGoogleUser.email,
        existingGoogleUser.role,
      );
      expect(result).toEqual({
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
      });
    });

    it('aynı e-posta ile local hesap varsa ConflictException fırlatmalı', async () => {
      prisma.user.findUnique.mockImplementation(
        ({ where }: { where: { googleId?: string; email?: string } }) => {
          if (where.googleId) {
            return Promise.resolve(null);
          }
          if (where.email) {
            return Promise.resolve(
              createMockUser({ authProvider: AuthProvider.local }),
            );
          }
          return Promise.resolve(null);
        },
      );

      await expect(
        service.validateOrCreateGoogleUser(mockGoogleProfile),
      ).rejects.toThrow(ConflictException);

      expect(tokenService.generateTokens).not.toHaveBeenCalled();
    });

    it('hiç kullanıcı yoksa yeni google kullanıcısı oluşturup token üretmeli', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const newGoogleUser = createMockUser({
        googleId: 'google-123456',
        email: 'googleuser@example.com',
        authProvider: AuthProvider.google,
        passwordHash: null,
      });
      prisma.user.create.mockResolvedValue(newGoogleUser);

      const result =
        await service.validateOrCreateGoogleUser(mockGoogleProfile);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'googleuser@example.com',
          googleId: 'google-123456',
          authProvider: 'google',
          firstName: 'Google',
          lastName: 'User',
          passwordHash: null,
        },
      });

      expect(tokenService.generateTokens).toHaveBeenCalledWith(
        newGoogleUser.id,
        newGoogleUser.email,
        newGoogleUser.role,
      );
      expect(result).toEqual({
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
      });
    });
  });
});
