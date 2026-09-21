import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as crypto from 'node:crypto';
import { AuditEvent, SecurityAuditService } from '../common/audit';
import { PrismaService } from '../prisma/prisma.service';
import {
  createMockRefreshToken,
  createMockRefreshTokenDto,
  createMockTokenMocks,
  createMockUser,
} from './test/auth.fixture';
import { TokenService } from './token.service';

describe('TokenService - rotateRefreshToken', () => {
  let service: TokenService;
  let mocks: ReturnType<typeof createMockTokenMocks>;
  let prisma: ReturnType<typeof createMockTokenMocks>['prisma'];
  let jwtService: ReturnType<typeof createMockTokenMocks>['jwtService'];
  let configService: ReturnType<typeof createMockTokenMocks>['configService'];
  let auditService: ReturnType<typeof createMockTokenMocks>['auditService'];

  const mockRefreshTokenDto = createMockRefreshTokenDto();

  beforeEach(async () => {
    mocks = createMockTokenMocks();
    prisma = mocks.prisma;
    jwtService = mocks.jwtService;
    configService = mocks.configService;
    auditService = mocks.auditService;

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should revoke old token and return new token pair when valid refresh token is provided', async () => {
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

    expect(prisma.refreshToken.update).toHaveBeenCalledWith({
      where: { id: mockDbToken.id },
      data: { revokedAt: expect.any(Date) as unknown as Date },
    });

    expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    expect(prisma.refreshToken.create).toHaveBeenCalled();

    expect(result).toEqual({
      access: 'mock-access-token',
      refresh: 'mock-refresh-token',
    });
    expect(auditService.info).toHaveBeenCalledWith(
      AuditEvent.AUTH_TOKEN_ROTATED,
      expect.objectContaining({
        userId: 'uuid-1234',
        ip: '127.0.0.1',
      }),
    );
  });

  it('should throw UnauthorizedException when JWT verification fails', async () => {
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

  it('should throw UnauthorizedException when refresh token is not found in database', async () => {
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

  it('TOKEN REUSE ATTACK: should revoke all user sessions when previously revoked token is presented', async () => {
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
    expect(auditService.alarm).toHaveBeenCalledWith(
      AuditEvent.AUTH_TOKEN_REUSE_DETECTED,
      expect.objectContaining({
        userId: 'uuid-1234',
        ip: '127.0.0.1',
      }),
    );
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when expired refresh token is presented', async () => {
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
