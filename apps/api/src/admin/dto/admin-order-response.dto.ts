import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class AdminOrderCustomerDto {
  @ApiProperty({ example: 'usr-123' })
  id!: string;

  @ApiProperty({ example: 'ahmet@example.com' })
  email!: string;

  @ApiPropertyOptional({ example: 'Ahmet' })
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'Yılmaz' })
  lastName?: string | null;

  @ApiPropertyOptional({ example: '+905551234567' })
  phoneNumber?: string | null;
}

export class AdminOrderItemDto {
  @ApiProperty({ example: 'item-1' })
  id!: string;

  @ApiProperty({ example: 'prod-1' })
  productId!: string;

  @ApiProperty({ example: 'var-1' })
  productVariantId!: string;

  @ApiProperty({ example: 'WHEY PROTEIN' })
  productName!: string;

  @ApiPropertyOptional({ example: 'Çikolata - 1000g' })
  variantName?: string | null;

  @ApiProperty({ example: 2 })
  pieces!: number;

  @ApiProperty({ example: 499 })
  unitPrice!: number;

  @ApiProperty({ example: 998 })
  totalPrice!: number;

  @ApiPropertyOptional({ example: 'media/products/whey.jpg' })
  photo?: string | null;
}

export class AdminOrderPaymentDto {
  @ApiProperty({ example: 'iyzico' })
  provider!: string;

  @ApiProperty({ example: 'tr-iyz-9988' })
  providerRef!: string;

  @ApiProperty({ example: 'credit_card' })
  cardType!: string;

  @ApiProperty({ example: '5428' })
  last4!: string;

  @ApiProperty({ example: 'SUCCESS' })
  status!: string;

  @ApiProperty({ example: '2026-09-18T20:00:00.000Z' })
  createdAt!: string;
}

export class AdminOrderListItemDto {
  @ApiProperty({ example: 'ord-123' })
  id!: string;

  @ApiProperty({ example: 'OJS-20260918-ABCD' })
  orderNo!: string;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.processing })
  status!: OrderStatus;

  @ApiProperty({ example: 998 })
  totalPrice!: number;

  @ApiProperty({ example: 29.9 })
  shippingFee!: number;

  @ApiProperty({ example: 2 })
  itemCount!: number;

  @ApiProperty({ example: '2026-09-18T20:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ type: AdminOrderCustomerDto })
  user!: AdminOrderCustomerDto;

  @ApiPropertyOptional({ type: AdminOrderPaymentDto, nullable: true })
  payment!: AdminOrderPaymentDto | null;
}

export class AdminOrderDetailResponseDto {
  @ApiProperty({ example: 'ord-123' })
  id!: string;

  @ApiProperty({ example: 'OJS-20260918-ABCD' })
  orderNo!: string;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.processing })
  status!: OrderStatus;

  @ApiProperty({ example: 998 })
  totalPrice!: number;

  @ApiProperty({ example: 29.9 })
  shippingFee!: number;

  @ApiProperty({
    example: {
      title: 'Ev',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      fullAddress: 'Örnek Mah. No:1',
      phoneNumber: '5551234567',
    },
  })
  addressSnapshot!: Record<string, unknown>;

  @ApiProperty({ example: '2026-09-18T20:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-09-18T20:00:00.000Z' })
  updatedAt!: string;

  @ApiProperty({ type: AdminOrderCustomerDto })
  user!: AdminOrderCustomerDto;

  @ApiProperty({ type: [AdminOrderItemDto] })
  items!: AdminOrderItemDto[];

  @ApiPropertyOptional({ type: AdminOrderPaymentDto, nullable: true })
  payment!: AdminOrderPaymentDto | null;
}

export class AdminOrdersPaginatedResponseDto {
  @ApiProperty({ example: 42 })
  count!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 0 })
  offset!: number;

  @ApiPropertyOptional({ example: 'OJS-2026' })
  search?: string | null;

  @ApiPropertyOptional({ enum: OrderStatus, example: OrderStatus.processing })
  status?: OrderStatus | null;

  @ApiProperty({ type: [AdminOrderListItemDto] })
  results!: AdminOrderListItemDto[];
}
