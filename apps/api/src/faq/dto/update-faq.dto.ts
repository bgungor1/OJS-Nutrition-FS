import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FAQ_CATEGORIES, FaqCategory } from '../faq.constants';

export class UpdateFaqDto {
  @ApiPropertyOptional({
    description: 'Sıkça sorulan soru başlığı',
    minLength: 5,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Soru metin olmalıdır.' })
  @MinLength(5, { message: 'Soru en az 5 karakter olmalıdır.' })
  @MaxLength(255, { message: 'Soru en fazla 255 karakter olabilir.' })
  question?: string;

  @ApiPropertyOptional({
    description: 'Sorunun ayrıntılı yanıtı',
    minLength: 10,
    maxLength: 2000,
  })
  @IsOptional()
  @IsString({ message: 'Yanıt metin olmalıdır.' })
  @MinLength(10, { message: 'Yanıt en az 10 karakter olmalıdır.' })
  @MaxLength(2000, { message: 'Yanıt en fazla 2000 karakter olabilir.' })
  answer?: string;

  @ApiPropertyOptional({
    description: 'Sorunun kategorisi',
    enum: FAQ_CATEGORIES,
  })
  @IsOptional()
  @IsString({ message: 'Kategori metin olmalıdır.' })
  @IsIn(FAQ_CATEGORIES, {
    message: `Geçersiz kategori. Desteklenenler: ${FAQ_CATEGORIES.join(', ')}`,
  })
  category?: FaqCategory;

  @ApiPropertyOptional({
    description: 'Görüntülenme sıralama indeksi',
    minimum: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Sıralama indeksi tam sayı olmalıdır.' })
  @Min(0, { message: 'Sıralama indeksi 0 veya pozitif olmalıdır.' })
  sortOrder?: number;
}
