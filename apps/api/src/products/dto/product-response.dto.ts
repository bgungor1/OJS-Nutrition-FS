import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiPriceInfoDto {
  @ApiPropertyOptional({
    example: 50.0,
    description: 'İndirim tutarı',
    nullable: true,
  })
  profit!: number | null;

  @ApiProperty({ example: 549.0, description: 'Orijinal liste fiyatı (TL)' })
  total_price!: number;

  @ApiPropertyOptional({
    example: 499.0,
    description: 'İndirimli satış fiyatı (TL)',
    nullable: true,
  })
  discounted_price!: number | null;

  @ApiPropertyOptional({
    example: 15.12,
    description: 'Porsiyon başına maliyet (TL)',
    nullable: true,
  })
  price_per_servings!: number | null;

  @ApiPropertyOptional({
    example: 9,
    description: 'İndirim yüzdesi (%)',
    nullable: true,
  })
  discount_percentage!: number | null;
}

export class ApiProductDto {
  @ApiProperty({ example: 'f8b1c4a0-1111-2222-3333-444455556666' })
  id!: string;

  @ApiProperty({ example: 'Whey Protein' })
  name!: string;

  @ApiProperty({ example: 'Yüksek kaliteli peynir altı suyu proteini' })
  short_explanation!: string;

  @ApiProperty({ example: 'whey-protein' })
  slug!: string;

  @ApiProperty({ type: ApiPriceInfoDto })
  price_info!: ApiPriceInfoDto;

  @ApiProperty({ example: 'media/products/whey-protein.jpg' })
  photo_src!: string;

  @ApiProperty({ example: 42, description: 'Toplam onaylanmış yorum sayısı' })
  comment_count!: number;

  @ApiProperty({ example: 4.8, description: 'Ortalama puan (1-5)' })
  average_star!: number;
}

export class ApiPaginatedProductsDto {
  @ApiProperty({ example: 25, description: 'Filtreye uyan toplam ürün adedi' })
  count!: number;

  @ApiPropertyOptional({
    example: '/products?offset=20&limit=20',
    nullable: true,
    description: 'Sonraki sayfa bağlantısı',
  })
  next!: string | null;

  @ApiPropertyOptional({
    example: null,
    nullable: true,
    description: 'Önceki sayfa bağlantısı',
  })
  previous!: string | null;

  @ApiProperty({ type: [ApiProductDto], description: 'Ürün listesi' })
  results!: ApiProductDto[];
}

export class ApiBestSellerProductDto {
  @ApiProperty({ example: 'Whey Protein' })
  name!: string;

  @ApiProperty({ example: 'En çok satan protein tozu' })
  short_explanation!: string;

  @ApiProperty({ example: 'whey-protein' })
  slug!: string;

  @ApiProperty({ type: ApiPriceInfoDto })
  price_info!: ApiPriceInfoDto;

  @ApiProperty({ example: 'media/products/whey-protein.jpg' })
  photo_src!: string;

  @ApiProperty({ example: 128 })
  comment_count!: number;

  @ApiProperty({ example: 4.9 })
  average_star!: number;
}
