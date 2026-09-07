import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @IsNotEmpty({ message: 'E-posta veya kullanıcı adı zorunludur.' })
  username!: string;

  @ApiProperty({ example: 'Passw0rd' })
  @IsString()
  @IsNotEmpty({ message: 'Şifre alanı zorunludur.' })
  password!: string;
}
