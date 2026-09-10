import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PaymentWebhookDto {
  @ApiProperty({
    description: 'Ödeme işlem durumu (örn. SUCCESS, FAILURE)',
    example: 'SUCCESS',
  })
  @IsString({ message: 'status bir metin olmalıdır.' })
  @IsNotEmpty({ message: 'status boş bırakılamaz.' })
  status!: string;

  @ApiProperty({
    description: 'iyzico tarafındaki benzersiz ödeme ID referansı',
    example: '12345678',
  })
  @IsString({ message: 'paymentId bir metin olmalıdır.' })
  @IsNotEmpty({ message: 'paymentId boş bırakılamaz.' })
  paymentId!: string;

  @ApiPropertyOptional({
    description: 'Sipariş veya oturum takip numarası (orderNo)',
    example: 'ORD-2026-000001',
  })
  @IsOptional()
  @IsString({ message: 'conversationId bir metin olmalıdır.' })
  conversationId?: string;

  @ApiPropertyOptional({
    description: 'iyzico olay tipi (örn. CHECKOUT_FORM_AUTH, THREEDS_AUTH)',
    example: 'THREEDS_AUTH',
  })
  @IsOptional()
  @IsString({ message: 'iyziEventType bir metin olmalıdır.' })
  iyziEventType?: string;

  @ApiPropertyOptional({
    description: 'iyzico referans kodu',
    example: 'REF-123456',
  })
  @IsOptional()
  @IsString({ message: 'iyziReferenceCode bir metin olmalıdır.' })
  iyziReferenceCode?: string;

  @ApiPropertyOptional({
    description: 'İşlemle ilişkili checkout veya ödeme token referansı',
    example: 'tok_sandbox_123',
  })
  @IsOptional()
  @IsString({ message: 'token bir metin olmalıdır.' })
  token?: string;
}
