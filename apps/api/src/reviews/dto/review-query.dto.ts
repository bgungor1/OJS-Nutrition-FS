import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  REVIEWS_PAGINATION,
  REVIEW_SORT_OPTIONS,
  ReviewSortOption,
} from '../reviews.constants';

export class ReviewQueryDto {
  @ApiPropertyOptional({
    description: 'Sayfa başına getirilecek yorum sayısı',
    default: REVIEWS_PAGINATION.DEFAULT_LIMIT,
    minimum: 1,
    maximum: REVIEWS_PAGINATION.MAX_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit tam sayı olmalıdır.' })
  @Min(1, { message: 'Limit en az 1 olmalıdır.' })
  @Max(REVIEWS_PAGINATION.MAX_LIMIT, {
    message: `Limit en fazla ${REVIEWS_PAGINATION.MAX_LIMIT} olabilir.`,
  })
  limit?: number;

  @ApiPropertyOptional({
    description: 'Atlanacak yorum sayısı (offset)',
    default: REVIEWS_PAGINATION.DEFAULT_OFFSET,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Offset tam sayı olmalıdır.' })
  @Min(0, { message: 'Offset 0 veya pozitif olmalıdır.' })
  offset?: number;

  @ApiPropertyOptional({
    description: 'Yalnızca belirli puana sahip yorumları filtreler',
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Puan tam sayı olmalıdır.' })
  @Min(1, { message: 'Puan en az 1 olmalıdır.' })
  @Max(5, { message: 'Puan en fazla 5 olabilir.' })
  rating?: number;

  @ApiPropertyOptional({
    description: 'Yorum sıralama seçeneği',
    enum: REVIEW_SORT_OPTIONS,
    default: 'newest',
  })
  @IsOptional()
  @IsIn(REVIEW_SORT_OPTIONS, {
    message: `Geçersiz sıralama seçeneği. Desteklenenler: ${REVIEW_SORT_OPTIONS.join(', ')}`,
  })
  sort?: ReviewSortOption;
}
