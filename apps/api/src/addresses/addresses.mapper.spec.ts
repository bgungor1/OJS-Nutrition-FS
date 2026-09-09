import {
  AddressWithRelations,
  toAddressResponse,
  toPaginatedAddressesResponse,
} from './addresses.mapper';

describe('AddressesMapper', () => {
  const mockDate = new Date('2026-09-09T12:00:00.000Z');

  const mockAddressWithRelations: AddressWithRelations = {
    id: 'addr-uuid-1',
    userId: 'user-uuid-1',
    title: 'Ev',
    firstName: 'Berkant',
    lastName: 'Güngör',
    countryId: 1,
    regionId: 1,
    subregionId: 1,
    fullAddress: 'Caferağa Mah. Moda Cad.',
    phoneNumber: '05551234567',
    createdAt: mockDate,
    updatedAt: mockDate,
    country: { id: 1, name: 'Türkiye' },
    region: { id: 1, name: 'İstanbul', countryId: 1 },
    subregion: { id: 1, name: 'Kadıköy', regionId: 1 },
  };

  describe('toAddressResponse', () => {
    it('ilişkili Prisma entity modelini doğru AddressResponseDto şekline dönüştürmeli', () => {
      const result = toAddressResponse(mockAddressWithRelations);

      expect(result).toEqual({
        id: 'addr-uuid-1',
        title: 'Ev',
        first_name: 'Berkant',
        last_name: 'Güngör',
        country_id: 1,
        country: { id: 1, name: 'Türkiye' },
        region_id: 1,
        region: { id: 1, name: 'İstanbul' },
        subregion_id: 1,
        subregion: { id: 1, name: 'Kadıköy' },
        full_address: 'Caferağa Mah. Moda Cad.',
        phone_number: '05551234567',
        created_at: '2026-09-09T12:00:00.000Z',
      });
    });

    it('ilişki alanları eksik olduğunda ID ve boş string fallback değerlerini kullanmalı', () => {
      const bareAddress: AddressWithRelations = {
        ...mockAddressWithRelations,
        country: null,
        region: null,
        subregion: null,
      };

      const result = toAddressResponse(bareAddress);

      expect(result.country).toEqual({ id: 1, name: '' });
      expect(result.region).toEqual({ id: 1, name: '' });
      expect(result.subregion).toEqual({ id: 1, name: '' });
    });
  });

  describe('toPaginatedAddressesResponse', () => {
    it('adres listesi ve toplam sayıyı doğru zarflamalı', () => {
      const result = toPaginatedAddressesResponse(
        [mockAddressWithRelations],
        1,
      );

      expect(result.count).toBe(1);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].id).toBe('addr-uuid-1');
    });

    it('boş listeyi doğru yönetmeli', () => {
      const result = toPaginatedAddressesResponse([], 0);

      expect(result.count).toBe(0);
      expect(result.results).toEqual([]);
    });
  });
});
