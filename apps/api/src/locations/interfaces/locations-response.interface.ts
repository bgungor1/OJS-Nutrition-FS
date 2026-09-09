import { ApiProperty } from '@nestjs/swagger';

export class CountryResponseDto {
  @ApiProperty({ example: 1, description: 'Ülke ID' })
  id!: number;

  @ApiProperty({ example: 'Türkiye', description: 'Ülke adı' })
  name!: string;
}

export class RegionResponseDto {
  @ApiProperty({ example: 1, description: 'İl ID' })
  id!: number;

  @ApiProperty({ example: 'İstanbul', description: 'İl adı' })
  name!: string;

  @ApiProperty({ example: 1, description: 'Bağlı olduğu Ülke ID' })
  country_id!: number;
}

export class SubregionResponseDto {
  @ApiProperty({ example: 1, description: 'İlçe ID' })
  id!: number;

  @ApiProperty({ example: 'Kadıköy', description: 'İlçe adı' })
  name!: string;

  @ApiProperty({ example: 1, description: 'Bağlı olduğu İl ID' })
  region_id!: number;
}
