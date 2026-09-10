import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CompleteShoppingDto {
  @ApiProperty({
    example: 'd3b07384-d113-469b-81d4-8d48695026ff',
    description: 'Kullanıcının kayıtlı teslimat ve fatura adresi UUID kimliği',
  })
  @IsUUID('4', { message: 'Geçerli bir adres kimliği (UUIDv4) giriniz.' })
  @IsNotEmpty({ message: 'address_id zorunludur.' })
  address_id!: string;

  @ApiProperty({
    example: 'credit_card',
    enum: ['credit_card', 'debit_card'],
    description: 'Ödeme kart tipi (credit_card | debit_card)',
  })
  @IsIn(['credit_card', 'debit_card'], {
    message: "payment_type yalnızca 'credit_card' veya 'debit_card' olabilir.",
  })
  payment_type!: 'credit_card' | 'debit_card';

  @ApiProperty({
    example: 'tok_sandbox_valid_payment_token_123',
    description:
      'Ödeme sağlayıcısının (iyzico vb.) client SDK ile ürettiği tek kullanımlık ödeme token değeri',
  })
  @IsString({ message: 'payment_token geçerli bir metin olmalıdır.' })
  @IsNotEmpty({ message: 'payment_token zorunludur.' })
  payment_token!: string;
}
