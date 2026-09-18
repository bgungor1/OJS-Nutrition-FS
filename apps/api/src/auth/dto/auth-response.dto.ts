import { ApiProperty } from '@nestjs/swagger';

/**
 * Swagger belgesi için auth yanıt sınıfları.
 * Orjinal interface'ler (auth-response.interface.ts) tip sistemi için korunur;
 * bu sınıflar yalnızca @ApiResponse({ type }) bağlaması için kullanılır.
 */

export class SafeUserDto {
  @ApiProperty({
    example: 'f8b1c4a0-1111-2222-3333-444455556666',
    description: 'Kullanıcı UUID',
  })
  id!: string;

  @ApiProperty({
    example: 'kullanici@example.com',
    description: 'Kullanıcı e-posta adresi',
  })
  email!: string;

  @ApiProperty({ example: 'Ahmet', description: 'Ad' })
  firstName!: string;

  @ApiProperty({ example: 'Yılmaz', description: 'Soyad' })
  lastName!: string;

  @ApiProperty({ example: 'customer', description: 'Kullanıcı rolü' })
  role!: string;

  @ApiProperty({
    example: '2026-01-15T10:30:00.000Z',
    description: 'Hesap oluşturma tarihi (ISO 8601)',
  })
  createdAt!: Date;
}

export class RegisterResponseDto {
  @ApiProperty({
    type: SafeUserDto,
    description: 'Oluşturulan kullanıcı bilgileri',
  })
  user!: SafeUserDto;

  @ApiProperty({
    example: 'Kayıt başarılı. Hoş geldiniz!',
    description: 'Başarı mesajı',
  })
  message!: string;
}

export class TokensResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Kısa ömürlü JWT erişim anahtarı (Bearer)',
  })
  access!: string;

  @ApiProperty({
    example: 'dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...',
    description: "Uzun ömürlü yenileme anahtarı (opaque, hash'li saklanır)",
  })
  refresh!: string;
}
