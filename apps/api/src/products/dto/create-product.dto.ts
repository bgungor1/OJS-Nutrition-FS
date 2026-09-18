import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  AminoAcidFactsDto,
  NutritionalIngredientDto,
  NutritionFactsDto,
} from './product-detail-response.dto';

export class NutritionalContentDto {
  @ApiProperty({ type: [NutritionalIngredientDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NutritionalIngredientDto)
  ingredients!: NutritionalIngredientDto[];

  @ApiProperty({ type: NutritionFactsDto })
  @ValidateNested()
  @Type(() => NutritionFactsDto)
  nutrition_facts!: NutritionFactsDto;

  @ApiProperty({ type: AminoAcidFactsDto })
  @ValidateNested()
  @Type(() => AminoAcidFactsDto)
  amino_acid_facts!: AminoAcidFactsDto;
}

export class CreateProductDto {
  @ApiProperty({
    example: 'Whey Protein Chocolate',
    description: 'Product name',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 'whey-protein-chocolate',
    description: 'URL-friendly unique identifier (slug)',
  })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({
    example: 'High-quality whey protein powder',
    description: 'Short product description (shown on listing cards)',
  })
  @IsString()
  @IsNotEmpty()
  shortExplanation!: string;

  @ApiProperty({
    example: 'Mix 1 scoop (30g) with cold water or milk.',
    description: 'Usage instructions',
  })
  @IsString()
  @IsNotEmpty()
  usage!: string;

  @ApiProperty({
    example: '24g protein\n85% protein content\nLow sugar',
    description: 'Product feature list (newline-separated)',
  })
  @IsString()
  @IsNotEmpty()
  features!: string;

  @ApiProperty({
    example: 'Supports post-workout muscle development...',
    description: 'Detailed product description (HTML-supported)',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    type: NutritionalContentDto,
    description: 'Nutritional values, ingredient list, and amino acid table',
  })
  @ValidateNested()
  @Type(() => NutritionalContentDto)
  nutritionalContent!: NutritionalContentDto;

  @ApiProperty({
    example: ['PROTEIN', 'WHEY', 'SPORTS'],
    description: 'Product tags',
  })
  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @ApiProperty({ example: 'cat-uuid-1234', description: 'Main category UUID' })
  @IsUUID()
  mainCategoryId!: string;

  @ApiProperty({ example: 'sub-uuid-5678', description: 'Sub-category UUID' })
  @IsUUID()
  subCategoryId!: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Best-seller flag (manual toggle)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isBestSeller?: boolean;

  @ApiPropertyOptional({
    example: 1,
    description: 'Best-seller rank (required when isBestSeller=true)',
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  bestSellerRank?: number;
}
