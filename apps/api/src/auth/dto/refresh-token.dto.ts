import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Kullanıcıya ait geçerli refresh token',
  })
  @IsNotEmpty({ message: 'Yenileme anahtarı (refresh token) zorunludur.' })
  @IsJWT({ message: 'Geçersiz yenileme anahtarı formatı.' })
  refresh!: string;
}
