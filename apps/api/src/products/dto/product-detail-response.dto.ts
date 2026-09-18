import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiProductVariantSizeDto {
  @ApiProperty({ example: 1000, description: 'Gram cinsinden net ağırlık' })
  gram!: number;

  @ApiProperty({ example: 1, description: 'Paket içi adet' })
  pieces!: number;

  @ApiProperty({ example: 33, description: 'Toplam servis adedi' })
  total_services!: number;
}

export class ApiProductVariantPriceDto {
  @ApiPropertyOptional({ example: 50.0, nullable: true })
  profit!: number | null;

  @ApiProperty({ example: 549.0 })
  total_price!: number;

  @ApiPropertyOptional({ example: 499.0, nullable: true })
  discounted_price!: number | null;

  @ApiProperty({ example: 15.12 })
  price_per_servings!: number;

  @ApiPropertyOptional({ example: 9, nullable: true })
  discount_percentage!: number | null;
}

export class ApiProductVariantDto {
  @ApiProperty({ example: 'c1d2e3f4-5678-90ab-cdef-123456789012' })
  id!: string;

  @ApiProperty({ type: ApiProductVariantSizeDto })
  size!: ApiProductVariantSizeDto;

  @ApiProperty({ example: 'Çikolata', description: 'Aroma / Varyant seçeneği' })
  aroma!: string;

  @ApiProperty({ type: ApiProductVariantPriceDto })
  price!: ApiProductVariantPriceDto;

  @ApiProperty({ example: 'media/products/whey-protein-cikolata.jpg' })
  photo_src!: string;

  @ApiProperty({ example: true, description: 'Stokta ve satışta olma durumu' })
  is_available!: boolean;
}

export class NutritionalIngredientDto {
  @ApiProperty({ example: 'Çikolata' })
  aroma!: string;

  @ApiProperty({
    example:
      'Peynir Altı Suyu Proteini Konsantresi, Kakao Tozu, Doğal Aroma...',
  })
  value!: string;
}

export class NutritionFactItemDto {
  @ApiProperty({ example: 'Enerji' })
  name!: string;

  @ApiProperty({ example: ['120 kcal', '6%'], type: [String] })
  amounts!: string[];
}

export class NutritionFactsDto {
  @ApiProperty({ type: [NutritionFactItemDto] })
  ingredients!: NutritionFactItemDto[];

  @ApiProperty({
    example: ['1 Porsiyon (30g)', '% Günlük Değer'],
    type: [String],
  })
  portion_sizes!: string[];
}

export class AminoAcidFactsDto {
  @ApiProperty({ type: [NutritionFactItemDto] })
  ingredients!: NutritionFactItemDto[];

  @ApiProperty({ example: ['100g Proteinde'], type: [String] })
  portion_sizes!: string[];
}

export class ApiNutritionalContentDto {
  @ApiProperty({ type: [NutritionalIngredientDto] })
  ingredients!: NutritionalIngredientDto[];

  @ApiProperty({ type: NutritionFactsDto })
  nutrition_facts!: NutritionFactsDto;

  @ApiProperty({ type: AminoAcidFactsDto })
  amino_acid_facts!: AminoAcidFactsDto;
}

export class ApiProductExplanationDto {
  @ApiProperty({ example: 'Antrenmandan sonra 1 ölçek (30g) tüketiniz.' })
  usage!: string;

  @ApiProperty({ example: '24g Protein, 5.5g BCAA, Düşük Şeker' })
  features!: string;

  @ApiProperty({
    example: 'OJS Nutrition Whey Protein, en yüksek kalite standartlarında...',
  })
  description!: string;

  @ApiProperty({ type: ApiNutritionalContentDto })
  nutritional_content!: ApiNutritionalContentDto;
}

export class ApiProductDetailDto {
  @ApiProperty({ example: 'f8b1c4a0-1111-2222-3333-444455556666' })
  id!: string;

  @ApiProperty({ example: 'Whey Protein' })
  name!: string;

  @ApiProperty({ example: 'whey-protein' })
  slug!: string;

  @ApiProperty({ example: 'Yüksek kaliteli peynir altı suyu proteini' })
  short_explanation!: string;

  @ApiProperty({ type: ApiProductExplanationDto })
  explanation!: ApiProductExplanationDto;

  @ApiProperty({ example: 'cat-protein' })
  main_category_id!: string;

  @ApiProperty({ example: 'subcat-whey' })
  sub_category_id!: string;

  @ApiProperty({ example: ['protein', 'whey', 'bcaa'], type: [String] })
  tags!: string[];

  @ApiProperty({ type: [ApiProductVariantDto] })
  variants!: ApiProductVariantDto[];

  @ApiProperty({ example: 42 })
  comment_count!: number;

  @ApiProperty({ example: 4.8 })
  average_star!: number;
}
