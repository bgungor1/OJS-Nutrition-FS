import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, ValidateIf } from 'class-validator';

export class LogoutDto {
  @ApiPropertyOptional({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'İptal edilecek refresh token (refresh)',
  })
  @ValidateIf((o: LogoutDto) => !o.refresh_token)
  @IsString({ message: 'Yenileme anahtarı (refresh) bir metin olmalıdır.' })
  refresh?: string;

  @ApiPropertyOptional({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Alternatif snake_case alan adı (refresh_token)',
  })
  @ValidateIf((o: LogoutDto) => !o.refresh)
  @IsString({
    message: 'Yenileme anahtarı (refresh_token) bir metin olmalıdır.',
  })
  refresh_token?: string;

  get refreshToken(): string {
    return this.refresh || this.refresh_token || '';
  }
}
