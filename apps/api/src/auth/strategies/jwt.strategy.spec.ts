import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { AppConfig } from '../../config/configuration';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let mockPrismaService: {
    user: {
      findUnique: jest.Mock;
    };
  };
  let mockConfigService: {
    get: jest.Mock;
  };

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn().mockReturnValue({
        accessSecret: 'test-jwt-secret-for-testing-1234567890',
      }),
    };
    mockPrismaService = {
      user: {
        findUnique: jest.fn(),
      },
    };

    strategy = new JwtStrategy(
      mockConfigService as unknown as ConfigService<AppConfig, true>,
      mockPrismaService as unknown as PrismaService,
    );
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user when user exists in database', async () => {
      const payload = { sub: 'usr-123', email: 'user@example.com' };
      const expectedUser = {
        id: 'usr-123',
        email: 'user@example.com',
        role: Role.customer,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(expectedUser);

      const result = await strategy.validate(payload);
      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'usr-123' },
        select: { id: true, email: true, role: true },
      });
    });

    it('should throw UnauthorizedException when user does not exist in database', async () => {
      const payload = { sub: 'usr-nonexistent', email: 'missing@example.com' };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
