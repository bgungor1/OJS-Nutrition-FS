import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 100;
export const MAX_PHONE_LENGTH = 20;
export const PHONE_NUMBER_REGEX = /^[+0-9\s()-]*$/;

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'Ahmet',
    description: 'Kullanıcının adı (en az 2, en fazla 100 karakter)',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'Ad metin formatında olmalıdır.' })
  @MinLength(MIN_NAME_LENGTH, {
    message: `Ad en az ${MIN_NAME_LENGTH} karakter olmalıdır.`,
  })
  @MaxLength(MAX_NAME_LENGTH, {
    message: `Ad en fazla ${MAX_NAME_LENGTH} karakter olabilir.`,
  })
  first_name?: string;

  @ApiPropertyOptional({
    example: 'Yılmaz',
    description: 'Kullanıcının soyadı (en az 2, en fazla 100 karakter)',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'Soyad metin formatında olmalıdır.' })
  @MinLength(MIN_NAME_LENGTH, {
    message: `Soyad en az ${MIN_NAME_LENGTH} karakter olmalıdır.`,
  })
  @MaxLength(MAX_NAME_LENGTH, {
    message: `Soyad en fazla ${MAX_NAME_LENGTH} karakter olabilir.`,
  })
  last_name?: string;

  @ApiPropertyOptional({
    example: '+905551234567',
    description: 'Telefon numarası (en fazla 20 karakter)',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'Telefon numarası metin formatında olmalıdır.' })
  @MaxLength(MAX_PHONE_LENGTH, {
    message: `Telefon numarası en fazla ${MAX_PHONE_LENGTH} karakter olabilir.`,
  })
  @Matches(PHONE_NUMBER_REGEX, {
    message: 'Geçersiz telefon numarası formatı.',
  })
  phone_number?: string;
}
