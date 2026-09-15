import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Ürüne verilen 1-5 arası puan',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt({ message: 'Puan tam sayı olmalıdır.' })
  @Min(1, { message: 'Puan en az 1 olmalıdır.' })
  @Max(5, { message: 'Puan en fazla 5 olabilir.' })
  rating!: number;

  @ApiProperty({
    description: 'Yorum başlığı',
    example: 'Harika bir ürün, tadı çok başarılı!',
    minLength: 2,
    maxLength: 150,
  })
  @IsString({ message: 'Başlık metin olmalıdır.' })
  @IsNotEmpty({ message: 'Başlık boş bırakılamaz.' })
  @MinLength(2, { message: 'Başlık en az 2 karakter olmalıdır.' })
  @MaxLength(150, { message: 'Başlık en fazla 150 karakter olabilir.' })
  title!: string;

  @ApiProperty({
    description: 'Yorum detay metni',
    example:
      'Düzenli olarak kullanıyorum, karışımı çok kolay ve sindirimi rahatsız etmiyor. Tavsiye ederim.',
    minLength: 5,
    maxLength: 2000,
  })
  @IsString({ message: 'Yorum metin olmalıdır.' })
  @IsNotEmpty({ message: 'Yorum boş bırakılamaz.' })
  @MinLength(5, { message: 'Yorum en az 5 karakter olmalıdır.' })
  @MaxLength(2000, { message: 'Yorum en fazla 2000 karakter olabilir.' })
  text!: string;

  @ApiPropertyOptional({
    description: 'Yorumla ilişkili görsel URL listesi',
    example: ['https://example.com/review1.jpg'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Görseller liste formatında olmalıdır.' })
  @IsString({ each: true, message: 'Her görsel URL olmalıdır.' })
  @ArrayMaxSize(5, { message: 'En fazla 5 görsel eklenebilir.' })
  images?: string[];
}
