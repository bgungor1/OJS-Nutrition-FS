import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { SecurityAuditService } from '../common/audit';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from './token.service';

describe('TokenService - generateTokens', () => {
  let service: TokenService;
  let prisma: {
    refreshToken: {
      create: jest.Mock;
    };
  };
  let jwtService: {
    signAsync: jest.Mock;
  };
  let configService: {
    get: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      refreshToken: {
        create: jest.fn(),
      },
    };

    jwtService = {
      signAsync: jest.fn((payload: { role?: string }) => {
        if (payload.role) {
          return Promise.resolve('mock-access-token');
        }
        return Promise.resolve('mock-refresh-token');
      }),
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
        { provide: SecurityAuditService, useValue: {} },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens and save refresh token hash in database', async () => {
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
});
