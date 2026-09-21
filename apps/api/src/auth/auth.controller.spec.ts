import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleAuthService } from './google-auth.service';
import {
  createMockLoginDto,
  createMockRefreshTokenDto,
  createMockRegisterDto,
  createMockSafeUser,
} from './test/auth.fixture';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
    refreshToken: jest.Mock;
    logout: jest.Mock;
    revokeAllSessions: jest.Mock;
  };
  let googleAuthService: {
    validateOrCreateGoogleUser: jest.Mock;
  };

  const mockTokens = {
    access: 'mock-access-token',
    refresh: 'mock-refresh-token',
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      refreshToken: jest.fn(),
      logout: jest.fn(),
      revokeAllSessions: jest.fn(),
    };

    googleAuthService = {
      validateOrCreateGoogleUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: GoogleAuthService, useValue: googleAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should forward register request to authService.register', async () => {
      const dto = createMockRegisterDto();
      const expectedResponse = {
        user: createMockSafeUser(),
        message: 'Kayıt başarıyla tamamlandı.',
      };
      authService.register.mockResolvedValue(expectedResponse);

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('login', () => {
    it('should forward login request with dto and client IP to authService.login', async () => {
      const dto = createMockLoginDto();
      const req = { ip: '192.168.1.1' } as Request;
      authService.login.mockResolvedValue(mockTokens);

      const result = await controller.login(dto, req);

      expect(authService.login).toHaveBeenCalledWith(dto, '192.168.1.1');
      expect(result).toEqual(mockTokens);
    });
  });

  describe('refreshToken', () => {
    it('should forward refresh request with dto and IP to authService.refreshToken', async () => {
      const dto = createMockRefreshTokenDto();
      const req = { ip: '127.0.0.1' } as Request;
      authService.refreshToken.mockResolvedValue(mockTokens);

      const result = await controller.refreshToken(dto, req);

      expect(authService.refreshToken).toHaveBeenCalledWith(dto, '127.0.0.1');
      expect(result).toEqual(mockTokens);
    });
  });

  describe('logout', () => {
    it('should forward logout request with dto and IP to authService.logout', async () => {
      const dto = {
        refresh: 'refresh-token-xyz',
        refreshToken: 'refresh-token-xyz',
      };
      const req = { ip: '127.0.0.1' } as Request;
      const expected = { message: 'Oturum başarıyla sonlandırıldı.' };
      authService.logout.mockResolvedValue(expected);

      const result = await controller.logout(dto, req);

      expect(authService.logout).toHaveBeenCalledWith(dto, '127.0.0.1');
      expect(result).toEqual(expected);
    });
  });

  describe('revokeAll', () => {
    it('should forward revoke-all request with authenticated user ID and IP to authService.revokeAllSessions', async () => {
      const user = {
        id: 'user-uuid-1',
        email: 'user@example.com',
        role: 'customer' as const,
      };
      const req = { ip: '127.0.0.1' } as Request;
      const expected = {
        message: 'Tüm aktif oturumlar başarıyla sonlandırıldı.',
      };
      authService.revokeAllSessions.mockResolvedValue(expected);

      const result = await controller.revokeAll(user, req);

      expect(authService.revokeAllSessions).toHaveBeenCalledWith(
        'user-uuid-1',
        '127.0.0.1',
      );
      expect(result).toEqual(expected);
    });
  });

  describe('googleAuth', () => {
    it('should invoke googleAuth method without errors', async () => {
      await expect(controller.googleAuth()).resolves.toBeUndefined();
    });
  });

  describe('googleAuthCallback', () => {
    const mockUser = {
      googleId: 'google-id',
      email: 'user@example.com',
      firstName: 'Google',
      lastName: 'User',
    };

    it('should return tokens via res.json when client accepts JSON', async () => {
      googleAuthService.validateOrCreateGoogleUser.mockResolvedValue(
        mockTokens,
      );
      const req = {
        user: mockUser,
        headers: { accept: 'application/json' },
      } as unknown as Request & { user: typeof mockUser };

      const jsonMock = jest.fn();
      const redirectMock = jest.fn();
      const res = {
        json: jsonMock,
        redirect: redirectMock,
      } as unknown as Response;

      await controller.googleAuthCallback(req, res);

      expect(googleAuthService.validateOrCreateGoogleUser).toHaveBeenCalledWith(
        mockUser,
      );
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'success',
        data: mockTokens,
      });
      expect(redirectMock).not.toHaveBeenCalled();
    });

    it('should redirect to frontend callback address by default', async () => {
      googleAuthService.validateOrCreateGoogleUser.mockResolvedValue(
        mockTokens,
      );
      const req = {
        user: mockUser,
        headers: { accept: 'text/html' },
      } as unknown as Request & { user: typeof mockUser };

      const jsonMock = jest.fn();
      const redirectMock = jest.fn();
      const res = {
        json: jsonMock,
        redirect: redirectMock,
      } as unknown as Response;

      await controller.googleAuthCallback(req, res);

      expect(googleAuthService.validateOrCreateGoogleUser).toHaveBeenCalledWith(
        mockUser,
      );
      expect(redirectMock).toHaveBeenCalledWith(
        expect.stringContaining(
          `/auth/callback?access=${mockTokens.access}&refresh=${mockTokens.refresh}`,
        ),
      );
      expect(jsonMock).not.toHaveBeenCalled();
    });
  });
});
