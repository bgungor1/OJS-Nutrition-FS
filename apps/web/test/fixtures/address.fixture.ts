import type { Address, Country, Region, Subregion } from '@/types';

export const mockCountries: Country[] = [{ id: 1, name: 'Türkiye' }];

export const mockRegions: Region[] = [{ id: 10, name: 'İstanbul', country_id: 1 }];

export const mockSubregions: Subregion[] = [{ id: 100, name: 'Kadıköy', region_id: 10 }];

export const mockExistingAddress: Address = {
  id: 'addr-123',
  title: 'Ev Adresi',
  first_name: 'Berkant',
  last_name: 'Güngör',
  phone_number: '05551234567',
  country_id: 1,
  region_id: 10,
  subregion_id: 100,
  full_address: 'Moda Cad. No: 5 Daire: 4 Kadıköy',
};
