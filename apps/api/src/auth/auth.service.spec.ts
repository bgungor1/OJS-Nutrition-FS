import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthProvider } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuditEvent, SecurityAuditService } from '../common/audit';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { createMockLoginDto, createMockUser } from './test/auth.fixture';
import { TokenService } from './token.service';

describe('AuthService - Login', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
    };
  };
  let tokenService: {
    generateTokens: jest.Mock;
  };
  let auditService: {
    info: jest.Mock;
    warn: jest.Mock;
  };

  const mockLoginDto = createMockLoginDto();

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
    };

    tokenService = {
      generateTokens: jest.fn().mockResolvedValue({
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
      }),
    };

    auditService = {
      info: jest.fn(),
      warn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: TokenService, useValue: tokenService },
        { provide: SecurityAuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Login', () => {
    it('should call tokenService.generateTokens and return token pair on valid credentials', async () => {
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
      expect(auditService.info).toHaveBeenCalledWith(
        AuditEvent.AUTH_LOGIN_SUCCESS,
        expect.objectContaining({
          userId: mockUser.id,
          ip: '127.0.0.1',
        }),
      );
    });

    it('should throw generic UnauthorizedException when user is not found to prevent user enumeration', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(mockLoginDto, '127.0.0.1')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(mockLoginDto, '127.0.0.1')).rejects.toThrow(
        'Geçersiz e-posta veya şifre.',
      );

      expect(tokenService.generateTokens).not.toHaveBeenCalled();
      expect(auditService.warn).toHaveBeenCalledWith(
        AuditEvent.AUTH_LOGIN_FAILED,
        expect.objectContaining({ ip: '127.0.0.1' }),
      );
    });

    it('should throw generic UnauthorizedException when user provider is not local', async () => {
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

    it('should throw generic UnauthorizedException on incorrect password', async () => {
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
});
