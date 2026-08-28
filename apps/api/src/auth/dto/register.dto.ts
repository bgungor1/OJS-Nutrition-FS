import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

// Frontend zod şemasıyla (apps/web/src/schemas/auth.ts) birebir aynı kural:
// min 8 karakter + en az bir büyük harf, bir küçük harf, bir rakam.
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
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
  @IsString()
  @IsNotEmpty()
  first_name!: string;

  @ApiProperty({ example: 'Lovelace' })
  @IsString()
  @IsNotEmpty()
  last_name!: string;
}
