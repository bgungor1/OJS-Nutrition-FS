import { BadRequestException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { createMockRegisterDto, createMockSafeUser } from './test/auth.fixture';

describe('AuthService - Faz 1.3.1 (Register)', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };

  const mockRegisterDto = createMockRegisterDto();

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

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

    // Hash kontrolü: kaydedilen hash bcrypt ile çözümlenebilir olmalı
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
