import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    example: 'error',
    description: 'Hata yanıtını belirten sabit değer',
    enum: ['error'],
  })
  status!: 'error';

  @ApiProperty({
    example: 400,
    description: 'HTTP durum kodu',
  })
  statusCode!: number;

  @ApiPropertyOptional({
    example: 'a3b1c2d4-e5f6-7890-abcd-ef1234567890',
    description: 'İstek izleme korelasyon kimliği (X-Correlation-ID)',
  })
  correlationId?: string;

  @ApiPropertyOptional({
    example: 'Doğrulama hatası oluştu.',
    description: 'İnsan tarafından okunabilir hata mesajı',
  })
  message?: string;

  @ApiPropertyOptional({
    example: { email: ['email must be an email'] },
    description:
      'Alan bazlı doğrulama hataları haritası (validation hatalarında döner)',
    type: 'object',
    additionalProperties: {
      type: 'array',
      items: { type: 'string' },
    },
  })
  reason?: Record<string, string[]>;
}
