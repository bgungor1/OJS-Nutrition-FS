import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CalculateShipmentFeeQueryDto {
  @ApiProperty({
    example: 'd3b07384-d113-469b-81d4-8d48695026ff',
    description: 'Teslimat yapılacak kullanıcı adresinin UUID kimliği',
  })
  @IsUUID('4', { message: 'Geçerli bir adres kimliği (UUIDv4) giriniz.' })
  @IsNotEmpty({ message: 'address_id sorgu parametresi zorunludur.' })
  address_id!: string;
}
