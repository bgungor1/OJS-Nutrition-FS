import { Address, Country, Region, Subregion } from '@prisma/client';
import {
  AddressResponseDto,
  PaginatedAddressesResponseDto,
} from './interfaces/address-response.interface';

export type AddressWithRelations = Address & {
  country?: Country | null;
  region?: Region | null;
  subregion?: Subregion | null;
};

export function toAddressResponse(
  address: AddressWithRelations,
): AddressResponseDto {
  return {
    id: address.id,
    title: address.title,
    first_name: address.firstName,
    last_name: address.lastName,
    country_id: address.countryId,
    country: {
      id: address.country?.id ?? address.countryId,
      name: address.country?.name ?? '',
    },
    region_id: address.regionId,
    region: {
      id: address.region?.id ?? address.regionId,
      name: address.region?.name ?? '',
    },
    subregion_id: address.subregionId,
    subregion: {
      id: address.subregion?.id ?? address.subregionId,
      name: address.subregion?.name ?? '',
    },
    full_address: address.fullAddress,
    phone_number: address.phoneNumber,
    created_at: address.createdAt.toISOString(),
  };
}

export function toPaginatedAddressesResponse(
  addresses: AddressWithRelations[],
  count: number,
): PaginatedAddressesResponseDto {
  return {
    count,
    results: addresses.map(toAddressResponse),
  };
}
