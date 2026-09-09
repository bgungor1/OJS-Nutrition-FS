import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { LocationsService } from './locations.service';

describe('LocationsService', () => {
  let service: LocationsService;
  let mockPrisma: {
    country: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
    region: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
    subregion: {
      findMany: jest.Mock;
    };
  };

  const mockCountries = [
    { id: 1, name: 'Türkiye' },
    { id: 2, name: 'Almanya' },
  ];

  const mockRegions = [
    { id: 1, name: 'İstanbul', countryId: 1 },
    { id: 2, name: 'Ankara', countryId: 1 },
  ];

  const mockSubregions = [
    { id: 1, name: 'Kadıköy', regionId: 1 },
    { id: 2, name: 'Beşiktaş', regionId: 1 },
  ];

  beforeEach(async () => {
    mockPrisma = {
      country: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      region: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      subregion: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
  });

  describe('findCountries', () => {
    it('ülkeleri alfabetik sıralı getirmeli', async () => {
      mockPrisma.country.findMany.mockResolvedValue(mockCountries);

      const result = await service.findCountries();

      expect(mockPrisma.country.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual([
        { id: 1, name: 'Türkiye' },
        { id: 2, name: 'Almanya' },
      ]);
    });
  });

  describe('findRegionsByCountryId', () => {
    it('ülke mevcutsa illeri doğru formatta getirmeli', async () => {
      mockPrisma.country.findUnique.mockResolvedValue(mockCountries[0]);
      mockPrisma.region.findMany.mockResolvedValue(mockRegions);

      const result = await service.findRegionsByCountryId(1);

      expect(mockPrisma.country.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrisma.region.findMany).toHaveBeenCalledWith({
        where: { countryId: 1 },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual([
        { id: 1, name: 'İstanbul', country_id: 1 },
        { id: 2, name: 'Ankara', country_id: 1 },
      ]);
    });

    it('ülke bulunamadığında NotFoundException fırlatmalı', async () => {
      mockPrisma.country.findUnique.mockResolvedValue(null);

      await expect(service.findRegionsByCountryId(999)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.region.findMany).not.toHaveBeenCalled();
    });
  });

  describe('findSubregionsByRegionId', () => {
    it('il mevcutsa ilçeleri doğru formatta getirmeli', async () => {
      mockPrisma.region.findUnique.mockResolvedValue(mockRegions[0]);
      mockPrisma.subregion.findMany.mockResolvedValue(mockSubregions);

      const result = await service.findSubregionsByRegionId(1);

      expect(mockPrisma.region.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrisma.subregion.findMany).toHaveBeenCalledWith({
        where: { regionId: 1 },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual([
        { id: 1, name: 'Kadıköy', region_id: 1 },
        { id: 2, name: 'Beşiktaş', region_id: 1 },
      ]);
    });

    it('il bulunamadığında NotFoundException fırlatmalı', async () => {
      mockPrisma.region.findUnique.mockResolvedValue(null);

      await expect(service.findSubregionsByRegionId(999)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.subregion.findMany).not.toHaveBeenCalled();
    });
  });
});
