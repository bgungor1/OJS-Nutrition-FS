import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FAQ_CATEGORIES, FaqCategory } from '../faq.constants';

export class CreateFaqDto {
  @ApiProperty({
    description: 'Sıkça sorulan soru başlığı',
    example: 'OJS Nutrition ürünlerinin menşei neresi?',
    minLength: 5,
    maxLength: 255,
  })
  @IsString({ message: 'Soru metin olmalıdır.' })
  @IsNotEmpty({ message: 'Soru boş bırakılamaz.' })
  @MinLength(5, { message: 'Soru en az 5 karakter olmalıdır.' })
  @MaxLength(255, { message: 'Soru en fazla 255 karakter olabilir.' })
  question!: string;

  @ApiProperty({
    description: 'Sorunun ayrıntılı yanıtı',
    example:
      'OJS Nutrition ürünleri, uluslararası standartlarda GMP onaylı tesislerde üretilmektedir.',
    minLength: 10,
    maxLength: 2000,
  })
  @IsString({ message: 'Yanıt metin olmalıdır.' })
  @IsNotEmpty({ message: 'Yanıt boş bırakılamaz.' })
  @MinLength(10, { message: 'Yanıt en az 10 karakter olmalıdır.' })
  @MaxLength(2000, { message: 'Yanıt en fazla 2000 karakter olabilir.' })
  answer!: string;

  @ApiProperty({
    description: 'Sorunun kategorisi',
    enum: FAQ_CATEGORIES,
    example: 'genel',
  })
  @IsString({ message: 'Kategori metin olmalıdır.' })
  @IsNotEmpty({ message: 'Kategori boş bırakılamaz.' })
  @IsIn(FAQ_CATEGORIES, {
    message: `Geçersiz kategori. Desteklenenler: ${FAQ_CATEGORIES.join(', ')}`,
  })
  category!: FaqCategory;

  @ApiPropertyOptional({
    description: 'Görüntülenme sıralama indeksi',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Sıralama indeksi tam sayı olmalıdır.' })
  @Min(0, { message: 'Sıralama indeksi 0 veya pozitif olmalıdır.' })
  sortOrder?: number;
}
