import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class DashboardSummaryDto {
  @ApiProperty({
    example: 1240,
    description: 'Sistemdeki toplam sipariş sayısı',
  })
  totalOrders!: number;

  @ApiProperty({
    example: 845250.75,
    description: 'İptal ve iadeler hariç toplam ciro (TL)',
  })
  totalRevenue!: number;

  @ApiProperty({ example: 680, description: 'Kayıtlı toplam kullanıcı sayısı' })
  totalUsers!: number;

  @ApiProperty({ example: 45, description: 'Katalogdaki toplam ürün sayısı' })
  totalProducts!: number;
}

export class OrdersByStatusDto {
  @ApiProperty({ example: 12 })
  pending!: number;

  @ApiProperty({ example: 25 })
  processing!: number;

  @ApiProperty({ example: 40 })
  shipped!: number;

  @ApiProperty({ example: 1140 })
  delivered!: number;

  @ApiProperty({ example: 15 })
  cancelled!: number;

  @ApiProperty({ example: 8 })
  returned!: number;
}

export class AdminRecentOrderDto {
  @ApiProperty({ example: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33' })
  id!: string;

  @ApiProperty({ example: 'ORD-2026-ABCD12' })
  orderNo!: string;

  @ApiProperty({ example: 'Ahmet Yılmaz' })
  customerName!: string;

  @ApiProperty({ example: 'ahmet@example.com' })
  customerEmail!: string;

  @ApiProperty({ example: 1299.9 })
  totalPrice!: number;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.processing })
  status!: OrderStatus;

  @ApiProperty({ example: 3, description: 'Siparişteki toplam ürün adedi' })
  itemsCount!: number;

  @ApiProperty({ example: '2026-03-18T14:30:00.000Z' })
  createdAt!: Date;
}

export class AdminTopProductDto {
  @ApiProperty({ example: 'prod-uuid-1' })
  productId!: string;

  @ApiProperty({ example: 'Whey Protein' })
  productName!: string;

  @ApiProperty({ example: 320, description: 'Toplam satılan adet' })
  totalQuantitySold!: number;

  @ApiProperty({
    example: 240000.0,
    description: 'Bu üründen elde edilen ciro (TL)',
  })
  totalRevenue!: number;

  @ApiPropertyOptional({
    example: 'media/products/whey-protein.jpg',
    nullable: true,
  })
  photoSrc!: string | null;
}

export class AdminLowStockVariantDto {
  @ApiProperty({ example: 'var-uuid-1' })
  variantId!: string;

  @ApiProperty({ example: 'prod-uuid-1' })
  productId!: string;

  @ApiProperty({ example: 'Whey Protein' })
  productName!: string;

  @ApiProperty({ example: 'whey-protein' })
  productSlug!: string;

  @ApiProperty({ example: 'Çikolata' })
  aroma!: string;

  @ApiProperty({ example: 1000 })
  gram!: number;

  @ApiProperty({ example: 3, description: 'Kalan stok miktarı' })
  stockQuantity!: number;

  @ApiProperty({ example: true })
  isAvailable!: boolean;

  @ApiProperty({ example: 'media/products/whey-cikolata.jpg' })
  photoSrc!: string;
}

export class AdminSalesTrendItemDto {
  @ApiProperty({ example: '2026-03-18', description: 'Tarih (YYYY-MM-DD)' })
  date!: string;

  @ApiProperty({ example: 14, description: 'O gün oluşturulan sipariş sayısı' })
  orderCount!: number;

  @ApiProperty({ example: 12500.5, description: 'O gün elde edilen ciro (TL)' })
  totalRevenue!: number;
}

export class DashboardStatsResponseDto {
  @ApiProperty({ type: DashboardSummaryDto })
  summary!: DashboardSummaryDto;

  @ApiProperty({ type: OrdersByStatusDto })
  ordersByStatus!: OrdersByStatusDto;

  @ApiProperty({ type: [AdminRecentOrderDto] })
  recentOrders!: AdminRecentOrderDto[];

  @ApiProperty({ type: [AdminTopProductDto] })
  topProducts!: AdminTopProductDto[];

  @ApiProperty({ type: [AdminLowStockVariantDto] })
  lowStockVariants!: AdminLowStockVariantDto[];

  @ApiProperty({ type: [AdminSalesTrendItemDto] })
  salesTrend!: AdminSalesTrendItemDto[];
}
