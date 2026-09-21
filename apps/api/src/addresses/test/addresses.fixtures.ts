import { CreateAddressDto } from '../dto/create-address.dto';

export const mockAddressDate = new Date('2026-09-09T12:00:00.000Z');

export const mockAddress = {
  id: 'addr-1',
  userId: 'user-1',
  title: 'Ev',
  firstName: 'Berkant',
  lastName: 'Güngör',
  countryId: 1,
  regionId: 1,
  subregionId: 1,
  fullAddress: 'Caferağa Mah. Moda Cad.',
  phoneNumber: '05551234567',
  createdAt: mockAddressDate,
  updatedAt: mockAddressDate,
  country: { id: 1, name: 'Türkiye' },
  region: { id: 1, name: 'İstanbul', countryId: 1 },
  subregion: { id: 1, name: 'Kadıköy', regionId: 1 },
};

export const mockCreateAddressDto: CreateAddressDto = {
  title: 'Ev',
  first_name: 'Berkant',
  last_name: 'Güngör',
  country_id: 1,
  region_id: 1,
  subregion_id: 1,
  full_address: 'Caferağa Mah. Moda Cad.',
  phone_number: '05551234567',
};
