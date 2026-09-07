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
    it('kayıt isteğini authService.register metoduna iletmeli', async () => {
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
    it('giriş isteğini dto ve istemci IP adresiyle authService.login metoduna iletmeli', async () => {
      const dto = createMockLoginDto();
      const req = { ip: '192.168.1.1' } as Request;
      authService.login.mockResolvedValue(mockTokens);

      const result = await controller.login(dto, req);

      expect(authService.login).toHaveBeenCalledWith(dto, '192.168.1.1');
      expect(result).toEqual(mockTokens);
    });
  });

  describe('refreshToken', () => {
    it('yenileme isteğini dto ve IP ile authService.refreshToken metoduna iletmeli', async () => {
      const dto = createMockRefreshTokenDto();
      const req = { ip: '127.0.0.1' } as Request;
      authService.refreshToken.mockResolvedValue(mockTokens);

      const result = await controller.refreshToken(dto, req);

      expect(authService.refreshToken).toHaveBeenCalledWith(dto, '127.0.0.1');
      expect(result).toEqual(mockTokens);
    });
  });

  describe('googleAuth', () => {
    it('googleAuth metodunu hatasız çağırmalı', async () => {
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

    it('istemci json kabul ettiğinde res.json ile token dönmeli', async () => {
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

    it('varsayılan durumda frontend callback adresine redirect yapmalı', async () => {
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
