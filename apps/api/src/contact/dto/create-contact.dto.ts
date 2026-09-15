import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CONTACT_LIMITS } from '../contact.constants';

export class CreateContactDto {
  @ApiProperty({
    description: 'Mesajı gönderen kişinin adı ve soyadı',
    example: 'Ahmet Yılmaz',
    minLength: CONTACT_LIMITS.NAME_MIN_LENGTH,
    maxLength: CONTACT_LIMITS.NAME_MAX_LENGTH,
  })
  @IsNotEmpty({ message: 'İsim alanı boş bırakılamaz.' })
  @IsString({ message: 'İsim metin formatında olmalıdır.' })
  @MinLength(CONTACT_LIMITS.NAME_MIN_LENGTH, {
    message: `İsim en az ${CONTACT_LIMITS.NAME_MIN_LENGTH} karakter olmalıdır.`,
  })
  @MaxLength(CONTACT_LIMITS.NAME_MAX_LENGTH, {
    message: `İsim en fazla ${CONTACT_LIMITS.NAME_MAX_LENGTH} karakter olabilir.`,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  name!: string;

  @ApiProperty({
    description: 'İletişim kurulacak e-posta adresi',
    example: 'ahmet.yilmaz@example.com',
    maxLength: CONTACT_LIMITS.EMAIL_MAX_LENGTH,
  })
  @IsNotEmpty({ message: 'E-posta alanı boş bırakılamaz.' })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz.' })
  @MaxLength(CONTACT_LIMITS.EMAIL_MAX_LENGTH, {
    message: `E-posta en fazla ${CONTACT_LIMITS.EMAIL_MAX_LENGTH} karakter olabilir.`,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email!: string;

  @ApiProperty({
    description: 'İletişim mesajı içeriği',
    example: 'Siparişimin teslimatı hakkında detaylı bilgi alabilir miyim?',
    minLength: CONTACT_LIMITS.MESSAGE_MIN_LENGTH,
    maxLength: CONTACT_LIMITS.MESSAGE_MAX_LENGTH,
  })
  @IsNotEmpty({ message: 'Mesaj alanı boş bırakılamaz.' })
  @IsString({ message: 'Mesaj metin formatında olmalıdır.' })
  @MinLength(CONTACT_LIMITS.MESSAGE_MIN_LENGTH, {
    message: `Mesaj en az ${CONTACT_LIMITS.MESSAGE_MIN_LENGTH} karakter olmalıdır.`,
  })
  @MaxLength(CONTACT_LIMITS.MESSAGE_MAX_LENGTH, {
    message: `Mesaj en fazla ${CONTACT_LIMITS.MESSAGE_MAX_LENGTH} karakter olabilir.`,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  message!: string;
}
