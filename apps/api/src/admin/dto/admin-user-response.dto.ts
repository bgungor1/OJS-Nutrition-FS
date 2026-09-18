import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthProvider, OrderStatus, Role } from '@prisma/client';

export class AdminUserListItemDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id!: string;

  @ApiProperty({ example: 'ahmet@example.com' })
  email!: string;

  @ApiProperty({ example: 'Ahmet' })
  firstName!: string;

  @ApiProperty({ example: 'Yılmaz' })
  lastName!: string;

  @ApiPropertyOptional({ example: '05551234567', nullable: true })
  phoneNumber!: string | null;

  @ApiProperty({ enum: Role, example: Role.customer })
  role!: Role;

  @ApiProperty({ enum: AuthProvider, example: AuthProvider.local })
  authProvider!: AuthProvider;

  @ApiProperty({
    example: 4,
    description: 'Kullanıcının toplam sipariş sayısı',
  })
  ordersCount!: number;

  @ApiProperty({
    example: 1850.5,
    description: 'Tamamlanan siparişlerin toplam harcama tutarı (TL)',
  })
  totalSpent!: number;

  @ApiProperty({ example: 2, description: 'Kayıtlı adres adedi' })
  addressesCount!: number;

  @ApiProperty({ example: '2026-03-01T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-03-05T14:30:00.000Z' })
  updatedAt!: Date;
}

export class AdminUsersPaginatedResponseDto {
  @ApiProperty({
    example: 42,
    description: 'Filtreyle eşleşen toplam kullanıcı sayısı',
  })
  count!: number;

  @ApiPropertyOptional({ example: '?limit=20&offset=20', nullable: true })
  next!: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  previous!: string | null;

  @ApiProperty({ type: [AdminUserListItemDto] })
  results!: AdminUserListItemDto[];
}

export class AdminUserAddressLocationDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Türkiye' })
  name!: string;
}

export class AdminUserAddressDto {
  @ApiProperty({ example: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22' })
  id!: string;

  @ApiProperty({ example: 'Ev Adresi' })
  title!: string;

  @ApiProperty({ example: 'Ahmet' })
  firstName!: string;

  @ApiProperty({ example: 'Yılmaz' })
  lastName!: string;

  @ApiProperty({ type: AdminUserAddressLocationDto })
  country!: AdminUserAddressLocationDto;

  @ApiProperty({ type: AdminUserAddressLocationDto })
  region!: AdminUserAddressLocationDto;

  @ApiProperty({ type: AdminUserAddressLocationDto })
  subregion!: AdminUserAddressLocationDto;

  @ApiProperty({ example: 'Atatürk Cad. No: 5 Daire: 3' })
  fullAddress!: string;

  @ApiProperty({ example: '05551234567' })
  phoneNumber!: string;

  @ApiProperty({ example: '2026-03-01T10:00:00.000Z' })
  createdAt!: Date;
}

export class AdminUserOrderSummaryDto {
  @ApiProperty({ example: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33' })
  id!: string;

  @ApiProperty({ example: 'ORD-2026-ABCD12' })
  orderNo!: string;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.delivered })
  status!: OrderStatus;

  @ApiProperty({ example: 649.9 })
  totalPrice!: number;

  @ApiProperty({ example: 2, description: 'Siparişteki ürün adedi' })
  itemsCount!: number;

  @ApiProperty({ example: '2026-03-02T15:20:00.000Z' })
  createdAt!: Date;
}

export class AdminUserDetailResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id!: string;

  @ApiProperty({ example: 'ahmet@example.com' })
  email!: string;

  @ApiProperty({ example: 'Ahmet' })
  firstName!: string;

  @ApiProperty({ example: 'Yılmaz' })
  lastName!: string;

  @ApiPropertyOptional({ example: '05551234567', nullable: true })
  phoneNumber!: string | null;

  @ApiProperty({ enum: Role, example: Role.customer })
  role!: Role;

  @ApiProperty({ enum: AuthProvider, example: AuthProvider.local })
  authProvider!: AuthProvider;

  @ApiProperty({ example: 4 })
  ordersCount!: number;

  @ApiProperty({ example: 1850.5 })
  totalSpent!: number;

  @ApiProperty({ example: '2026-03-01T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-03-05T14:30:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({ type: [AdminUserAddressDto] })
  addresses!: AdminUserAddressDto[];

  @ApiProperty({ type: [AdminUserOrderSummaryDto] })
  recentOrders!: AdminUserOrderSummaryDto[];
}
