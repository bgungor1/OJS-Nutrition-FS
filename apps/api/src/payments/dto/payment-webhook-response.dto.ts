import { ApiProperty } from '@nestjs/swagger';

export class PaymentWebhookResponseDto {
  @ApiProperty({
    example: true,
    description: 'Webhook bildiriminin alındığı ve doğrulandığı teyidi',
  })
  received!: boolean;

  @ApiProperty({
    example: 'success',
    description: 'Bildirim işleme durumu (success, ignored, unhandled)',
  })
  status!: string;
}
