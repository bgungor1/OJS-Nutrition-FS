import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz.' })
  email!: string;

  @ApiProperty({ example: 'Passw0rd' })
  @IsString()
  @MinLength(8)
  @Matches(PASSWORD_RULE, {
    message:
      'password en az bir büyük harf, bir küçük harf ve bir rakam içermeli',
  })
  password!: string;

  @ApiProperty({ example: 'Passw0rd' })
  @IsString()
  @IsNotEmpty()
  password2!: string;

  @ApiProperty({ example: 'Ada' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty({ message: 'Ad alanı zorunludur.' })
  first_name!: string;

  @ApiProperty({ example: 'Lovelace' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty({ message: 'Soyad alanı zorunludur.' })
  last_name!: string;
}
