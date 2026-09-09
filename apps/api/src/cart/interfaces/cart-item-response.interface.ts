import { ApiProperty } from '@nestjs/swagger';

export class CartProductSummaryDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'Whey Protein' })
  name!: string;

  @ApiProperty({ example: 'whey-protein' })
  slug!: string;

  @ApiProperty({ example: 'media/products/whey-protein-cikolata.jpg' })
  photo_src!: string;

  @ApiProperty({
    example: 'media/products/whey-protein-cikolata.jpg',
    description: 'Vite SPA geriye dönük uyumluluk alias alanı',
  })
  photo!: string;
}

export class CartVariantSizeDto {
  @ApiProperty({ example: 1000, description: 'Gram cinsinden net ağırlık' })
  gram!: number;

  @ApiProperty({ example: 1, description: 'Paket içi adet' })
  pieces!: number;

  @ApiProperty({ example: 33, description: 'Toplam servis adedi' })
  total_services!: number;
}

export class CartVariantPriceDto {
  @ApiProperty({ example: 549.0, description: 'Normal liste fiyatı' })
  total_price!: number;

  @ApiProperty({
    example: 499.0,
    nullable: true,
    description: 'İndirimli satış fiyatı',
  })
  discounted_price!: number | null;

  @ApiProperty({ example: 15.12, description: 'Porsiyon başına maliyet' })
  price_per_servings!: number;

  @ApiProperty({
    example: 9,
    nullable: true,
    description: 'İndirim yüzdesi (%)',
  })
  discount_percentage!: number | null;

  @ApiProperty({
    example: 50.0,
    nullable: true,
    description: 'Kazanç / İndirim tutarı',
  })
  profit!: number | null;
}

export class CartVariantSummaryDto {
  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  id!: string;

  @ApiProperty({ example: 'Çikolata' })
  aroma!: string;

  @ApiProperty({ type: CartVariantSizeDto })
  size!: CartVariantSizeDto;

  @ApiProperty({ type: CartVariantPriceDto })
  price!: CartVariantPriceDto;

  @ApiProperty({ example: 'media/products/whey-protein-cikolata.jpg' })
  photo_src!: string;

  @ApiProperty({
    example: true,
    description: 'Admin satışı açık ve stok > 0 durumu',
  })
  is_available!: boolean;

  @ApiProperty({ example: 100, description: 'Mevcut stok adedi' })
  stock_quantity!: number;
}

export class CartItemResponseDto {
  @ApiProperty({ example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
  id!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  product_id!: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  product_variant_id!: string;

  @ApiProperty({ example: 2, description: 'Sepetteki adet' })
  pieces!: number;

  @ApiProperty({ example: '2026-09-09T12:00:00.000Z' })
  created_at!: string;

  @ApiProperty({ example: '2026-09-09T12:00:00.000Z' })
  updated_at!: string;

  @ApiProperty({ type: CartProductSummaryDto })
  product!: CartProductSummaryDto;

  @ApiProperty({ type: CartVariantSummaryDto })
  variant!: CartVariantSummaryDto;
}

export type CartItemResponse = CartItemResponseDto;
export type CartProductSummary = CartProductSummaryDto;
export type CartVariantSummary = CartVariantSummaryDto;
