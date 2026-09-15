import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FAQ_CATEGORIES, FaqCategory } from '../faq.constants';

export class FaqQueryDto {
  @ApiPropertyOptional({
    description: 'SSS kategorisine göre filtreleme',
    enum: FAQ_CATEGORIES,
    example: 'genel',
  })
  @IsOptional()
  @IsString({ message: 'Kategori metin olmalıdır.' })
  @IsIn(FAQ_CATEGORIES, {
    message: `Geçersiz kategori. Desteklenenler: ${FAQ_CATEGORIES.join(', ')}`,
  })
  category?: FaqCategory;
}
