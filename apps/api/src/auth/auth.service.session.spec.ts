import { Test, TestingModule } from '@nestjs/testing';
import { SecurityAuditService } from '../common/audit';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { createMockRefreshTokenDto } from './test/auth.fixture';
import { TokenService } from './token.service';

describe('AuthService - Session Management (Refresh, Logout, RevokeAll)', () => {
  let service: AuthService;
  let tokenService: {
    rotateRefreshToken: jest.Mock;
    revokeRefreshToken: jest.Mock;
    revokeAllUserTokens: jest.Mock;
  };

  const mockRefreshTokenDto = createMockRefreshTokenDto();

  beforeEach(async () => {
    tokenService = {
      rotateRefreshToken: jest.fn().mockResolvedValue({
        access: 'mock-rotated-access-token',
        refresh: 'mock-rotated-refresh-token',
      }),
      revokeRefreshToken: jest.fn().mockResolvedValue(undefined),
      revokeAllUserTokens: jest.fn().mockResolvedValue(2),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: {} },
        { provide: TokenService, useValue: tokenService },
        { provide: SecurityAuditService, useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('RefreshToken', () => {
    it('should delegate refreshToken request to tokenService.rotateRefreshToken', async () => {
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

  describe('Logout and RevokeAll', () => {
    it('should call tokenService.revokeRefreshToken on logout and return success message', async () => {
      const logoutDto = {
        refresh: 'test-refresh-token',
        refreshToken: 'test-refresh-token',
      };

      const result = await service.logout(logoutDto, '127.0.0.1');

      expect(tokenService.revokeRefreshToken).toHaveBeenCalledWith(
        'test-refresh-token',
        '127.0.0.1',
      );
      expect(result).toEqual({
        message: 'Oturum başarıyla sonlandırıldı.',
      });
    });

    it('should call tokenService.revokeAllUserTokens on revokeAllSessions and return success message', async () => {
      const result = await service.revokeAllSessions(
        'user-uuid-1',
        '127.0.0.1',
      );

      expect(tokenService.revokeAllUserTokens).toHaveBeenCalledWith(
        'user-uuid-1',
        '127.0.0.1',
        'USER_REVOKE_ALL',
      );
      expect(result).toEqual({
        message: 'Tüm aktif oturumlar başarıyla sonlandırıldı.',
      });
    });
  });
});
