import { Test, TestingModule } from '@nestjs/testing';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';

describe('LocationsController', () => {
  let controller: LocationsController;
  let mockLocationsService: {
    findCountries: jest.Mock;
    findRegionsByCountryId: jest.Mock;
    findSubregionsByRegionId: jest.Mock;
  };

  beforeEach(async () => {
    mockLocationsService = {
      findCountries: jest.fn(),
      findRegionsByCountryId: jest.fn(),
      findSubregionsByRegionId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationsController],
      providers: [
        {
          provide: LocationsService,
          useValue: mockLocationsService,
        },
      ],
    }).compile();

    controller = module.get<LocationsController>(LocationsController);
  });

  describe('getCountries', () => {
    it('LocationsService.findCountries metodunu çağırmalı', async () => {
      const mockResult = [{ id: 1, name: 'Türkiye' }];
      mockLocationsService.findCountries.mockResolvedValue(mockResult);

      const result = await controller.getCountries();

      expect(mockLocationsService.findCountries).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getRegionsByCountry', () => {
    it('LocationsService.findRegionsByCountryId metodunu doğru parametreyle çağırmalı', async () => {
      const mockResult = [{ id: 1, name: 'İstanbul', country_id: 1 }];
      mockLocationsService.findRegionsByCountryId.mockResolvedValue(mockResult);

      const result = await controller.getRegionsByCountry(1);

      expect(mockLocationsService.findRegionsByCountryId).toHaveBeenCalledWith(
        1,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getSubregionsByRegion', () => {
    it('LocationsService.findSubregionsByRegionId metodunu doğru parametreyle çağırmalı', async () => {
      const mockResult = [{ id: 1, name: 'Kadıköy', region_id: 1 }];
      mockLocationsService.findSubregionsByRegionId.mockResolvedValue(
        mockResult,
      );

      const result = await controller.getSubregionsByRegion(1);

      expect(
        mockLocationsService.findSubregionsByRegionId,
      ).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResult);
    });
  });
});
