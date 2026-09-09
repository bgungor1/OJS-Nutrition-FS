import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Sepete eklenecek ürünün UUID kimliği',
  })
  @IsUUID('4', { message: 'Geçerli bir ürün ID (UUIDv4) giriniz.' })
  @IsNotEmpty({ message: 'product_id zorunludur.' })
  product_id!: string;

  @ApiProperty({
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    description: 'Sepete eklenecek ürün varyantının UUID kimliği',
  })
  @IsUUID('4', { message: 'Geçerli bir varyant ID (UUIDv4) giriniz.' })
  @IsNotEmpty({ message: 'product_variant_id zorunludur.' })
  product_variant_id!: string;

  @ApiProperty({
    example: 1,
    minimum: 1,
    description: 'Sepete eklenecek adet (en az 1)',
  })
  @IsInt({ message: 'Adet tam sayı olmalıdır.' })
  @Min(1, { message: 'Sepete en az 1 adet eklenebilir.' })
  pieces!: number;
}
