import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export const PRODUCT_SORT_VALUES = [
  'price_asc',
  'price_desc',
  'newest',
  'rating',
] as const;

export type ProductSortOption = (typeof PRODUCT_SORT_VALUES)[number];

export class ProductsQueryDto {
  @ApiPropertyOptional({
    description: 'Sayfa başına dönecek ürün adedi (varsayılan: 20, max: 100)',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({
    description: 'Atlanacak ürün adedi (sayfalama offset)',
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number = 0;

  @ApiPropertyOptional({
    description:
      'Kategori veya alt kategori slug filtresi (örn: protein, whey)',
    example: 'protein',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description:
      'Sıralama ölçütü (Query DoS engeli için açık beyaz liste ile sınırlandırılmıştır)',
    enum: PRODUCT_SORT_VALUES,
    example: 'price_asc',
  })
  @IsOptional()
  @IsIn(PRODUCT_SORT_VALUES)
  sort?: ProductSortOption;
}
