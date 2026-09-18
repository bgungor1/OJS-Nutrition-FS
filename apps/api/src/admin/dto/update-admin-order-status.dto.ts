import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateAdminOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.shipped,
    description: 'Yeni sipariş durumu',
  })
  @IsEnum(OrderStatus, {
    message: `Geçerli bir sipariş durumu belirtiniz (${Object.values(OrderStatus).join(', ')}).`,
  })
  @IsNotEmpty({ message: 'status zorunludur.' })
  status!: OrderStatus;
}
