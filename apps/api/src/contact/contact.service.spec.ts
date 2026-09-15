import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ContactMessage } from '@prisma/client';
import { PrismaService } from '../prisma';
import { CreateContactDto, UpdateContactDto } from './dto';
import { ContactService } from './contact.service';

describe('ContactService', () => {
  let service: ContactService;
  let prisma: {
    contactMessage: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const mockDate = new Date('2026-09-15T12:00:00.000Z');

  const mockContactMessage: ContactMessage = {
    id: 'f93d3950-e14b-4b2e-a579-30ec6071efc5',
    name: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@example.com',
    message: 'Kargo durumu hakkında bilgi almak istiyorum.',
    handled: false,
    createdAt: mockDate,
  };

  beforeEach(async () => {
    prisma = {
      contactMessage: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<ContactService>(ContactService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('submit', () => {
    it('should create and save a new contact message with handled: false', async () => {
      const dto: CreateContactDto = {
        name: '  Ahmet Yılmaz  ',
        email: '  AHMET.YILMAZ@EXAMPLE.COM  ',
        message: '  Siparişim hakkında bilgi almak istiyorum.  ',
      };

      prisma.contactMessage.create.mockResolvedValue({
        id: 'f93d3950-e14b-4b2e-a579-30ec6071efc5',
        name: 'Ahmet Yılmaz',
        email: 'ahmet.yilmaz@example.com',
        message: 'Siparişim hakkında bilgi almak istiyorum.',
        handled: false,
        createdAt: mockDate,
      });

      const result = await service.submit(dto);

      expect(result).toEqual({
        id: 'f93d3950-e14b-4b2e-a579-30ec6071efc5',
        message: 'Mesajınız alındı',
      });

      expect(prisma.contactMessage.create).toHaveBeenCalledWith({
        data: {
          name: 'Ahmet Yılmaz',
          email: 'ahmet.yilmaz@example.com',
          message: 'Siparişim hakkında bilgi almak istiyorum.',
          handled: false,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated contact messages with default values', async () => {
      prisma.contactMessage.findMany.mockResolvedValue([mockContactMessage]);
      prisma.contactMessage.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(result.count).toBe(1);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].id).toBe(mockContactMessage.id);
      expect(result.results[0].created_at).toBe('2026-09-15T12:00:00.000Z');

      expect(prisma.contactMessage.findMany).toHaveBeenCalledWith({
        where: {},
        take: 20,
        skip: 0,
        orderBy: { createdAt: 'desc' },
      });
      expect(prisma.contactMessage.count).toHaveBeenCalledWith({ where: {} });
    });

    it('should filter by handled when provided', async () => {
      prisma.contactMessage.findMany.mockResolvedValue([]);
      prisma.contactMessage.count.mockResolvedValue(0);

      await service.findAll({ handled: true, limit: 10, offset: 5 });

      expect(prisma.contactMessage.findMany).toHaveBeenCalledWith({
        where: { handled: true },
        take: 10,
        skip: 5,
        orderBy: { createdAt: 'desc' },
      });
      expect(prisma.contactMessage.count).toHaveBeenCalledWith({
        where: { handled: true },
      });
    });

    it('should filter by handled=false when provided', async () => {
      prisma.contactMessage.findMany.mockResolvedValue([]);
      prisma.contactMessage.count.mockResolvedValue(0);

      await service.findAll({ handled: false });

      expect(prisma.contactMessage.findMany).toHaveBeenCalledWith({
        where: { handled: false },
        take: 20,
        skip: 0,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findById', () => {
    it('should return contact message response when found', async () => {
      prisma.contactMessage.findUnique.mockResolvedValue(mockContactMessage);

      const result = await service.findById(mockContactMessage.id);

      expect(result.id).toBe(mockContactMessage.id);
      expect(result.name).toBe(mockContactMessage.name);
      expect(result.email).toBe(mockContactMessage.email);
      expect(result.created_at).toBe('2026-09-15T12:00:00.000Z');
    });

    it('should throw NotFoundException when message is not found', async () => {
      prisma.contactMessage.findUnique.mockResolvedValue(null);

      await expect(service.findById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update handled status of the message', async () => {
      prisma.contactMessage.findUnique.mockResolvedValue({
        id: mockContactMessage.id,
      });
      prisma.contactMessage.update.mockResolvedValue({
        ...mockContactMessage,
        handled: true,
      });

      const dto: UpdateContactDto = { handled: true };
      const result = await service.update(mockContactMessage.id, dto);

      expect(result.handled).toBe(true);
      expect(prisma.contactMessage.update).toHaveBeenCalledWith({
        where: { id: mockContactMessage.id },
        data: { handled: true },
      });
    });

    it('should throw NotFoundException when message to update does not exist', async () => {
      prisma.contactMessage.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { handled: true }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete contact message and return id', async () => {
      prisma.contactMessage.findUnique.mockResolvedValue({
        id: mockContactMessage.id,
      });
      prisma.contactMessage.delete.mockResolvedValue(mockContactMessage);

      const result = await service.delete(mockContactMessage.id);

      expect(result).toEqual({ id: mockContactMessage.id });
      expect(prisma.contactMessage.delete).toHaveBeenCalledWith({
        where: { id: mockContactMessage.id },
      });
    });

    it('should throw NotFoundException when message to delete does not exist', async () => {
      prisma.contactMessage.findUnique.mockResolvedValue(null);

      await expect(service.delete('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
