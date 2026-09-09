import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export const PHONE_NUMBER_REGEX = /^[+0-9\s()-]{10,20}$/;

export class CreateAddressDto {
  @ApiProperty({
    example: 'Ev Adresim',
    description: 'Adres başlığı (2-50 karakter)',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'Adres başlığı metin olmalıdır.' })
  @IsNotEmpty({ message: 'Adres başlığı zorunludur.' })
  @MinLength(2, { message: 'Adres başlığı en az 2 karakter olmalıdır.' })
  @MaxLength(50, { message: 'Adres başlığı en fazla 50 karakter olabilir.' })
  title!: string;

  @ApiProperty({
    example: 'Berkant',
    description: 'Alıcı adı (2-50 karakter)',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'Alıcı adı metin olmalıdır.' })
  @IsNotEmpty({ message: 'Alıcı adı zorunludur.' })
  @MinLength(2, { message: 'Alıcı adı en az 2 karakter olmalıdır.' })
  @MaxLength(50, { message: 'Alıcı adı en fazla 50 karakter olabilir.' })
  first_name!: string;

  @ApiProperty({
    example: 'Güngör',
    description: 'Alıcı soyadı (2-50 karakter)',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'Alıcı soyadı metin olmalıdır.' })
  @IsNotEmpty({ message: 'Alıcı soyadı zorunludur.' })
  @MinLength(2, { message: 'Alıcı soyadı en az 2 karakter olmalıdır.' })
  @MaxLength(50, { message: 'Alıcı soyadı en fazla 50 karakter olabilir.' })
  last_name!: string;

  @ApiProperty({
    example: 1,
    description: 'Ülke ID (Locations lookup üzerinden)',
  })
  @IsInt({ message: 'Ülke ID tamsayı olmalıdır.' })
  @Min(1, { message: 'Geçersiz ülke ID.' })
  country_id!: number;

  @ApiProperty({
    example: 1,
    description: 'İl ID (Locations lookup üzerinden)',
  })
  @IsInt({ message: 'İl ID tamsayı olmalıdır.' })
  @Min(1, { message: 'Geçersiz il ID.' })
  region_id!: number;

  @ApiProperty({
    example: 1,
    description: 'İlçe ID (Locations lookup üzerinden)',
  })
  @IsInt({ message: 'İlçe ID tamsayı olmalıdır.' })
  @Min(1, { message: 'Geçersiz ilçe ID.' })
  subregion_id!: number;

  @ApiProperty({
    example: 'Caferağa Mah. Moda Cad. No:12 D:4',
    description: 'Açık adres (10-255 karakter)',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'Açık adres metin olmalıdır.' })
  @IsNotEmpty({ message: 'Açık adres zorunludur.' })
  @MinLength(10, { message: 'Açık adres en az 10 karakter olmalıdır.' })
  @MaxLength(255, { message: 'Açık adres en fazla 255 karakter olabilir.' })
  full_address!: string;

  @ApiProperty({
    example: '05551234567',
    description: 'Telefon numarası (10-20 karakter)',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'Telefon numarası metin olmalıdır.' })
  @IsNotEmpty({ message: 'Telefon numarası zorunludur.' })
  @Matches(PHONE_NUMBER_REGEX, {
    message: 'Geçerli bir telefon numarası giriniz (örn: 05551234567).',
  })
  phone_number!: string;
}
