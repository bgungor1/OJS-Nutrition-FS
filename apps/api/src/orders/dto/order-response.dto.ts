import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class AddressSnapshotDto {
  @ApiProperty({ example: 'Ev', description: 'Adres başlığı' })
  title!: string;

  @ApiProperty({ example: 'Ahmet', description: 'Ad' })
  firstName!: string;

  @ApiProperty({ example: 'Yılmaz', description: 'Soyad' })
  lastName!: string;

  @ApiProperty({ example: '+905321234567', description: 'Telefon numarası' })
  phoneNumber!: string;

  @ApiProperty({ example: 'Türkiye', description: 'Ülke' })
  country!: string;

  @ApiProperty({ example: 'İstanbul', description: 'Bölge/İl' })
  region!: string;

  @ApiProperty({ example: 'Kadıköy', description: 'Alt bölge/İlçe' })
  subregion!: string;

  @ApiProperty({
    example: 'Moda Cad. No:5 Daire:3',
    description: 'Açık adres',
  })
  fullAddress!: string;
}

export class OrderItemResponseDto {
  @ApiProperty({ example: 'f8b1c4a0-1111-2222-3333-444455556666' })
  id!: string;

  @ApiProperty({ example: 'a1b2c3d4-5678-90ef-abcd-ef1234567890' })
  product_id!: string;

  @ApiProperty({ example: 'c1d2e3f4-5678-90ab-cdef-123456789012' })
  product_variant_id!: string;

  @ApiProperty({ example: 'Whey Protein 1000g', description: 'Ürün adı' })
  product_name!: string;

  @ApiPropertyOptional({
    example: 'Çikolata',
    description: 'Varyant adı (ör. lezzet, boyut)',
    nullable: true,
  })
  variant_name!: string | null;

  @ApiProperty({ example: 2, description: 'Miktar' })
  pieces!: number;

  @ApiProperty({ example: 599.9, description: 'Birim fiyat (TRY)' })
  unit_price!: number;

  @ApiProperty({ example: 1199.8, description: 'Satır toplamı (TRY)' })
  total_price!: number;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000.jpg',
    nullable: true,
  })
  photo!: string | null;

  @ApiPropertyOptional({
    example: 'media/products/550e8400-e29b-41d4-a716-446655440000.jpg',
    nullable: true,
  })
  photo_src!: string | null;
}

export class PaymentSummaryResponseDto {
  @ApiProperty({ example: 'iyzico', description: 'Ödeme sağlayıcısı' })
  provider!: string;

  @ApiProperty({
    example: 'PAY-20260918-001',
    description: 'Sağlayıcı referans kodu',
  })
  provider_ref!: string;

  @ApiProperty({ example: 'CREDIT_CARD', description: 'Kart tipi' })
  card_type!: string;

  @ApiProperty({ example: '4242', description: 'Kartın son 4 hanesi' })
  last4!: string;

  @ApiProperty({ example: 'SUCCESS', description: 'Ödeme durumu' })
  status!: string;

  @ApiProperty({ example: '2026-09-18T12:00:00.000Z', description: 'ISO 8601' })
  created_at!: string;
}

export class OrderDetailResponseDto {
  @ApiProperty({ example: 'f8b1c4a0-1111-2222-3333-444455556666' })
  id!: string;

  @ApiProperty({
    example: 'ORD-20260918-0042',
    description: 'Sipariş numarası',
  })
  order_no!: string;

  @ApiProperty({ enum: OrderStatus, description: 'Sipariş durumu' })
  status!: OrderStatus;

  @ApiProperty({ example: 1299.8, description: 'Toplam tutar (TRY)' })
  total_price!: number;

  @ApiProperty({ example: 49.9, description: 'Kargo ücreti (TRY)' })
  shipping_fee!: number;

  @ApiProperty({ example: 1199.8, description: 'Ara toplam (TRY)' })
  subtotal!: number;

  @ApiProperty({ type: AddressSnapshotDto })
  address_snapshot!: AddressSnapshotDto;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items!: OrderItemResponseDto[];

  @ApiProperty({ type: [OrderItemResponseDto] })
  cart_detail!: OrderItemResponseDto[];

  @ApiPropertyOptional({ type: PaymentSummaryResponseDto, nullable: true })
  payment!: PaymentSummaryResponseDto | null;

  @ApiProperty({ example: '2026-09-18T12:00:00.000Z' })
  created_at!: string;

  @ApiProperty({ example: '2026-09-18T12:05:00.000Z' })
  updated_at!: string;
}

export class OrderSummaryResponseDto {
  @ApiProperty({ example: 'f8b1c4a0-1111-2222-3333-444455556666' })
  id!: string;

  @ApiProperty({ example: 'ORD-20260918-0042' })
  order_no!: string;

  @ApiProperty({ enum: OrderStatus })
  status!: OrderStatus;

  @ApiProperty({ example: 1299.8 })
  total_price!: number;

  @ApiProperty({ example: 49.9 })
  shipping_fee!: number;

  @ApiProperty({ example: 3, description: 'Sipariş kalem sayısı' })
  item_count!: number;

  @ApiProperty({ example: '2026-09-18T12:00:00.000Z' })
  created_at!: string;

  @ApiProperty({ example: '2026-09-18T12:05:00.000Z' })
  updated_at!: string;

  @ApiPropertyOptional({ type: PaymentSummaryResponseDto, nullable: true })
  payment!: PaymentSummaryResponseDto | null;
}

export class PaginatedOrdersResponseDto {
  @ApiProperty({ example: 42, description: 'Toplam sipariş sayısı' })
  count!: number;

  @ApiProperty({ type: [OrderSummaryResponseDto] })
  results!: OrderSummaryResponseDto[];
}

export class ShipmentFeeResponseDto {
  @ApiProperty({
    example: 49.9,
    description: 'Hesaplanan kargo ücreti (TRY). Ücretsiz ise 0.',
  })
  fee!: number;

  @ApiProperty({ example: 'TRY', description: 'Para birimi' })
  currency!: string;

  @ApiProperty({
    example: 500,
    description: 'Ücretsiz kargo eşiği (TRY)',
  })
  free_shipping_threshold!: number;

  @ApiProperty({
    example: false,
    description: 'Kargo ücretsiz mi?',
  })
  is_free!: boolean;
}

export class PaymentSettingsResponseDto {
  @ApiProperty({
    example: ['mastercard', 'visa', 'troy'],
    type: [String],
    description: 'Desteklenen kredi/banka kartı türleri',
  })
  card_types!: string[];

  @ApiProperty({
    example: ['credit_card', 'debit_card'],
    type: [String],
    description: 'Desteklenen ödeme yöntemleri',
  })
  payment_types!: string[];

  @ApiProperty({
    example: 'TRY',
    description: 'Ödeme para birimi',
  })
  currency!: string;
}
