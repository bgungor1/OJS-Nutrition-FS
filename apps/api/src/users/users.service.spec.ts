import { Logger, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuditEvent, SecurityAuditService } from '../common/audit';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };
  let auditService: {
    info: jest.Mock;
    warn: jest.Mock;
    alarm: jest.Mock;
    record: jest.Mock;
  };

  const mockDbUser = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    firstName: 'Berk',
    lastName: 'Güngör',
    phoneNumber: '+905551112233',
    role: 'customer' as const,
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    auditService = {
      info: jest.fn(),
      warn: jest.fn(),
      alarm: jest.fn(),
      record: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: SecurityAuditService,
          useValue: auditService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMyAccount', () => {
    it('should return safe AccountProfile object when user exists', async () => {
      prisma.user.findUnique.mockResolvedValue(mockDbUser);

      const result = await service.getMyAccount('user-uuid-1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          role: true,
        },
      });
      expect(result).toEqual({
        id: 'user-uuid-1',
        email: 'test@example.com',
        first_name: 'Berk',
        last_name: 'Güngör',
        phone_number: '+905551112233',
        role: 'customer',
      });
    });

    it('should throw NotFoundException when user is not found in database', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getMyAccount('non-existing-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getMyAccount('non-existing-id')).rejects.toThrow(
        'Kullanıcı hesabı bulunamadı.',
      );
    });
  });

  describe('updateMyAccount', () => {
    it('should update profile information successfully and return updated profile', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-uuid-1' });
      prisma.user.update.mockResolvedValue({
        ...mockDbUser,
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        phoneNumber: '+905559998877',
      });

      const dto = {
        first_name: 'Ahmet',
        last_name: 'Yılmaz',
        phone_number: '+905559998877',
      };

      const result = await service.updateMyAccount('user-uuid-1', dto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        select: { id: true },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        data: {
          firstName: 'Ahmet',
          lastName: 'Yılmaz',
          phoneNumber: '+905559998877',
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          role: true,
        },
      });
      expect(result).toEqual({
        id: 'user-uuid-1',
        email: 'test@example.com',
        first_name: 'Ahmet',
        last_name: 'Yılmaz',
        phone_number: '+905559998877',
        role: 'customer',
      });
      expect(auditService.info).toHaveBeenCalledWith(
        AuditEvent.USER_PROFILE_UPDATED,
        expect.objectContaining({
          userId: 'user-uuid-1',
          details: { updatedFields: ['firstName', 'lastName', 'phoneNumber'] },
        }),
      );
    });

    it('should update only provided fields on partial update', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-uuid-1' });
      prisma.user.update.mockResolvedValue({
        ...mockDbUser,
        lastName: 'YeniSoyad',
      });

      const dto = {
        last_name: 'YeniSoyad',
      };

      const result = await service.updateMyAccount('user-uuid-1', dto);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        data: {
          lastName: 'YeniSoyad',
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          role: true,
        },
      });
      expect(result.last_name).toBe('YeniSoyad');
    });

    it('should throw NotFoundException when user to update does not exist in database', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateMyAccount('non-existing-id', { first_name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should record audit log when profile is updated', async () => {
      const loggerSpy = jest
        .spyOn(Logger.prototype, 'log')
        .mockImplementation();
      prisma.user.findUnique.mockResolvedValue({ id: 'user-uuid-1' });
      prisma.user.update.mockResolvedValue(mockDbUser);

      await service.updateMyAccount('user-uuid-1', { first_name: 'YeniAd' });

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          '[Audit] User user-uuid-1 updated profile: firstName',
        ),
      );
    });
  });
});
