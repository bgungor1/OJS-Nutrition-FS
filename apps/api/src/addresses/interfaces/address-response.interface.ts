import { ApiProperty } from '@nestjs/swagger';

export class LocationReferenceDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'İstanbul' })
  name!: string;
}

export class AddressResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'Ev Adresim' })
  title!: string;

  @ApiProperty({ example: 'Berkant' })
  first_name!: string;

  @ApiProperty({ example: 'Güngör' })
  last_name!: string;

  @ApiProperty({ example: 1 })
  country_id!: number;

  @ApiProperty({ type: LocationReferenceDto })
  country!: LocationReferenceDto;

  @ApiProperty({ example: 1 })
  region_id!: number;

  @ApiProperty({ type: LocationReferenceDto })
  region!: LocationReferenceDto;

  @ApiProperty({ example: 1 })
  subregion_id!: number;

  @ApiProperty({ type: LocationReferenceDto })
  subregion!: LocationReferenceDto;

  @ApiProperty({ example: 'Caferağa Mah. Moda Cad. No:12 D:4' })
  full_address!: string;

  @ApiProperty({ example: '05551234567' })
  phone_number!: string;

  @ApiProperty({ example: '2026-09-09T12:00:00.000Z' })
  created_at!: string;
}

export class PaginatedAddressesResponseDto {
  @ApiProperty({ example: 1, description: 'Toplam adres adedi' })
  count!: number;

  @ApiProperty({
    type: [AddressResponseDto],
    description: 'Adres listesi',
  })
  results!: AddressResponseDto[];
}

export class DeleteAddressResponseDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Silinen adres ID',
  })
  id!: string;
}
