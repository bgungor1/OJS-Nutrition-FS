import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AddressesService } from './addresses.service';
import { UpdateAddressDto } from './dto/update-address.dto';
import { mockAddress, mockCreateAddressDto } from './test/addresses.fixtures';

describe('AddressesService', () => {
  let service: AddressesService;
  let mockPrisma: {
    address: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    subregion: { findFirst: jest.Mock };
  };

  beforeEach(async () => {
    mockPrisma = {
      address: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      subregion: { findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AddressesService>(AddressesService);
  });

  describe('validateLocationHierarchy', () => {
    it('should complete without errors when hierarchy is valid', async () => {
      mockPrisma.subregion.findFirst.mockResolvedValue({ id: 1 });

      await expect(
        service.validateLocationHierarchy(1, 1, 1),
      ).resolves.toBeUndefined();

      expect(mockPrisma.subregion.findFirst).toHaveBeenCalledWith({
        where: { id: 1, regionId: 1, region: { countryId: 1 } },
      });
    });

    it('should throw BadRequestException when hierarchy does not match', async () => {
      mockPrisma.subregion.findFirst.mockResolvedValue(null);

      await expect(
        service.validateLocationHierarchy(1, 1, 999),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('list', () => {
    it('should return paginated user addresses and total count', async () => {
      mockPrisma.address.findMany.mockResolvedValue([mockAddress]);
      mockPrisma.address.count.mockResolvedValue(1);

      const result = await service.list('user-1', { limit: 10, offset: 0 });

      expect(mockPrisma.address.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: { country: true, region: true, subregion: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0,
      });
      expect(mockPrisma.address.count).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(result.count).toBe(1);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].id).toBe('addr-1');
    });
  });

  describe('getById', () => {
    it('should query and return address with id and userId', async () => {
      mockPrisma.address.findFirst.mockResolvedValue(mockAddress);

      const result = await service.getById('user-1', 'addr-1');

      expect(mockPrisma.address.findFirst).toHaveBeenCalledWith({
        where: { id: 'addr-1', userId: 'user-1' },
        include: { country: true, region: true, subregion: true },
      });
      expect(result.id).toBe('addr-1');
    });

    it('should throw NotFoundException when address not found or belongs to another user (IDOR)', async () => {
      mockPrisma.address.findFirst.mockResolvedValue(null);

      await expect(service.getById('user-2', 'addr-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createDto = mockCreateAddressDto;

    it('should create and return address when hierarchy is valid', async () => {
      mockPrisma.subregion.findFirst.mockResolvedValue({ id: 1 });
      mockPrisma.address.create.mockResolvedValue(mockAddress);

      const result = await service.create('user-1', createDto);

      expect(mockPrisma.address.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          title: 'Ev',
          firstName: 'Berkant',
          lastName: 'Güngör',
          countryId: 1,
          regionId: 1,
          subregionId: 1,
          fullAddress: 'Caferağa Mah. Moda Cad.',
          phoneNumber: '05551234567',
        },
        include: { country: true, region: true, subregion: true },
      });
      expect(result.id).toBe('addr-1');
    });

    it('should throw BadRequestException without creating address on invalid hierarchy', async () => {
      mockPrisma.subregion.findFirst.mockResolvedValue(null);

      await expect(service.create('user-1', createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrisma.address.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateDto: UpdateAddressDto = {
      title: 'İş Yeri',
      region_id: 1,
      subregion_id: 2,
    };

    it('should update address when it belongs to user and hierarchy is valid', async () => {
      mockPrisma.address.findFirst.mockResolvedValue(mockAddress);
      mockPrisma.subregion.findFirst.mockResolvedValue({ id: 2 });
      mockPrisma.address.update.mockResolvedValue({
        ...mockAddress,
        title: 'İş Yeri',
        subregionId: 2,
      });

      const result = await service.update('user-1', 'addr-1', updateDto);

      expect(mockPrisma.address.findFirst).toHaveBeenCalledWith({
        where: { id: 'addr-1', userId: 'user-1' },
      });
      expect(mockPrisma.address.update).toHaveBeenCalledWith({
        where: { id: 'addr-1' },
        data: { title: 'İş Yeri', regionId: 1, subregionId: 2 },
        include: { country: true, region: true, subregion: true },
      });
      expect(result.title).toBe('İş Yeri');
    });

    it('should throw NotFoundException when address belongs to another user (IDOR)', async () => {
      mockPrisma.address.findFirst.mockResolvedValue(null);

      await expect(
        service.update('user-2', 'addr-1', updateDto),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrisma.address.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete address and return { id } when it belongs to user', async () => {
      mockPrisma.address.findFirst.mockResolvedValue(mockAddress);
      mockPrisma.address.delete.mockResolvedValue(mockAddress);

      const result = await service.delete('user-1', 'addr-1');

      expect(mockPrisma.address.findFirst).toHaveBeenCalledWith({
        where: { id: 'addr-1', userId: 'user-1' },
      });
      expect(mockPrisma.address.delete).toHaveBeenCalledWith({
        where: { id: 'addr-1' },
      });
      expect(result).toEqual({ id: 'addr-1' });
    });

    it('should throw NotFoundException when address belongs to another user (IDOR)', async () => {
      mockPrisma.address.findFirst.mockResolvedValue(null);

      await expect(service.delete('user-2', 'addr-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.address.delete).not.toHaveBeenCalled();
    });
  });
});
