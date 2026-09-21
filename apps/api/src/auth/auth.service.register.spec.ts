import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AuditEvent, SecurityAuditService } from '../common/audit';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { createMockRegisterDto, createMockSafeUser } from './test/auth.fixture';
import { TokenService } from './token.service';

describe('AuthService - Register', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };
  let auditService: {
    info: jest.Mock;
  };

  const mockRegisterDto = createMockRegisterDto();

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    auditService = {
      info: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: TokenService, useValue: {} },
        { provide: SecurityAuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw BadRequestException when passwords do not match', async () => {
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

  it('should throw ConflictException when email is already in use', async () => {
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

  it('should successfully register user with valid data and hash password', async () => {
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
    expect(auditService.info).toHaveBeenCalledWith(
      AuditEvent.AUTH_REGISTER,
      expect.objectContaining({ userId: createdUser.id }),
    );
  });
});
