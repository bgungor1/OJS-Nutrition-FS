import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';
import { AddressesQueryDto } from './dto/addresses-query.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import {
  AddressResponseDto,
  PaginatedAddressesResponseDto,
} from './interfaces/address-response.interface';

describe('AddressesController', () => {
  let controller: AddressesController;
  let addressesService: {
    list: jest.Mock;
    getById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const mockUser: AuthenticatedUser = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    role: 'customer',
  };

  const mockAddressResponse: AddressResponseDto = {
    id: 'addr-uuid-1',
    title: 'Ev Adresim',
    first_name: 'Berkant',
    last_name: 'Güngör',
    country_id: 1,
    country: { id: 1, name: 'Türkiye' },
    region_id: 1,
    region: { id: 1, name: 'İstanbul' },
    subregion_id: 1,
    subregion: { id: 1, name: 'Kadıköy' },
    full_address: 'Caferağa Mah. Moda Cad. No:12 D:4',
    phone_number: '05551234567',
    created_at: '2026-09-09T12:00:00.000Z',
  };

  beforeEach(async () => {
    addressesService = {
      list: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddressesController],
      providers: [{ provide: AddressesService, useValue: addressesService }],
    }).compile();

    controller = module.get<AddressesController>(AddressesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('kullanıcının adres listesini addressesService.list metodundan alıp dönmeli', async () => {
      const query: AddressesQueryDto = { limit: 20, offset: 0 };
      const paginatedResult: PaginatedAddressesResponseDto = {
        count: 1,
        results: [mockAddressResponse],
      };
      addressesService.list.mockResolvedValue(paginatedResult);

      const result = await controller.list(mockUser, query);

      expect(addressesService.list).toHaveBeenCalledWith('user-uuid-1', query);
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('getById', () => {
    it('belirtilen adresi addressesService.getById metodundan alıp dönmeli', async () => {
      addressesService.getById.mockResolvedValue(mockAddressResponse);

      const result = await controller.getById(mockUser, 'addr-uuid-1');

      expect(addressesService.getById).toHaveBeenCalledWith(
        'user-uuid-1',
        'addr-uuid-1',
      );
      expect(result).toEqual(mockAddressResponse);
    });
  });

  describe('create', () => {
    it('yeni adres oluşturma isteğini addressesService.create metoduna iletmeli', async () => {
      const dto: CreateAddressDto = {
        title: 'Ev Adresim',
        first_name: 'Berkant',
        last_name: 'Güngör',
        country_id: 1,
        region_id: 1,
        subregion_id: 1,
        full_address: 'Caferağa Mah. Moda Cad. No:12 D:4',
        phone_number: '05551234567',
      };
      addressesService.create.mockResolvedValue(mockAddressResponse);

      const result = await controller.create(mockUser, dto);

      expect(addressesService.create).toHaveBeenCalledWith('user-uuid-1', dto);
      expect(result).toEqual(mockAddressResponse);
    });
  });

  describe('update', () => {
    it('adres güncelleme isteğini addressesService.update metoduna iletmeli', async () => {
      const dto: UpdateAddressDto = {
        title: 'İş Adresim',
      };
      const updatedAddress: AddressResponseDto = {
        ...mockAddressResponse,
        title: 'İş Adresim',
      };
      addressesService.update.mockResolvedValue(updatedAddress);

      const result = await controller.update(mockUser, 'addr-uuid-1', dto);

      expect(addressesService.update).toHaveBeenCalledWith(
        'user-uuid-1',
        'addr-uuid-1',
        dto,
      );
      expect(result).toEqual(updatedAddress);
    });
  });

  describe('delete', () => {
    it('adres silme isteğini addressesService.delete metoduna iletmeli', async () => {
      addressesService.delete.mockResolvedValue({ id: 'addr-uuid-1' });

      const result = await controller.delete(mockUser, 'addr-uuid-1');

      expect(addressesService.delete).toHaveBeenCalledWith(
        'user-uuid-1',
        'addr-uuid-1',
      );
      expect(result).toEqual({ id: 'addr-uuid-1' });
    });
  });
});
