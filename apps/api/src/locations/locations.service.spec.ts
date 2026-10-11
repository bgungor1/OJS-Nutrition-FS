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
    it('should return countries sorted alphabetically', async () => {
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
    it('should return regions in correct format when country exists', async () => {
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

    it('should throw NotFoundException when country is not found', async () => {
      mockPrisma.country.findUnique.mockResolvedValue(null);

      await expect(service.findRegionsByCountryId(999)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.region.findMany).not.toHaveBeenCalled();
    });
  });

  describe('findSubregionsByRegionId', () => {
    it('should return subregions in correct format when region exists', async () => {
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

    it('should throw NotFoundException when region is not found', async () => {
      mockPrisma.region.findUnique.mockResolvedValue(null);

      await expect(service.findSubregionsByRegionId(999)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.subregion.findMany).not.toHaveBeenCalled();
    });
  });

  describe('caching behavior', () => {
    let cachedService: LocationsService;
    let mockCache: {
      get: jest.Mock;
      set: jest.Mock;
    };

    beforeEach(async () => {
      mockCache = {
        get: jest.fn(),
        set: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LocationsService,
          { provide: PrismaService, useValue: mockPrisma },
          { provide: 'CACHE_MANAGER', useValue: mockCache },
        ],
      }).compile();

      cachedService = module.get<LocationsService>(LocationsService);
    });

    it('should return cached countries without querying database on cache hit', async () => {
      mockCache.get.mockResolvedValue(mockCountries);

      const result = await cachedService.findCountries();

      expect(result).toEqual(mockCountries);
      expect(mockCache.get).toHaveBeenCalledWith('locations:countries');
      expect(mockPrisma.country.findMany).not.toHaveBeenCalled();
    });

    it('should query database and populate cache on cache miss', async () => {
      mockCache.get.mockResolvedValue(undefined);
      mockPrisma.country.findMany.mockResolvedValue(mockCountries);

      const result = await cachedService.findCountries();

      expect(result).toEqual(mockCountries);
      expect(mockCache.get).toHaveBeenCalledWith('locations:countries');
      expect(mockPrisma.country.findMany).toHaveBeenCalled();
      expect(mockCache.set).toHaveBeenCalledWith(
        'locations:countries',
        mockCountries,
        24 * 60 * 60 * 1000,
      );
    });

    it('should return cached regions without querying database on cache hit', async () => {
      const cachedRegions = [{ id: 1, name: 'İstanbul', country_id: 1 }];
      mockCache.get.mockResolvedValue(cachedRegions);

      const result = await cachedService.findRegionsByCountryId(1);

      expect(result).toEqual(cachedRegions);
      expect(mockCache.get).toHaveBeenCalledWith('locations:regions:1');
      expect(mockPrisma.country.findUnique).not.toHaveBeenCalled();
      expect(mockPrisma.region.findMany).not.toHaveBeenCalled();
    });

    it('should return cached subregions without querying database on cache hit', async () => {
      const cachedSubregions = [{ id: 1, name: 'Kadıköy', region_id: 1 }];
      mockCache.get.mockResolvedValue(cachedSubregions);

      const result = await cachedService.findSubregionsByRegionId(1);

      expect(result).toEqual(cachedSubregions);
      expect(mockCache.get).toHaveBeenCalledWith('locations:subregions:1');
      expect(mockPrisma.region.findUnique).not.toHaveBeenCalled();
      expect(mockPrisma.subregion.findMany).not.toHaveBeenCalled();
    });
  });
});
