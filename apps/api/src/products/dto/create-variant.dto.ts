import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

/**
 * OJS Nutrition — Admin variant create request DTO.
 *
 * Business rule: discountedPrice < totalPrice (BACKEND_PLAN.md §5.3).
 * is_available in API responses is computed at the response layer:
 * isAvailable && stockQuantity > 0 (BACKEND_PLAN.md §4 note).
 */
export class CreateVariantDto {
  @ApiProperty({ example: 'Chocolate', description: 'Flavour / taste' })
  @IsString()
  @IsNotEmpty()
  aroma!: string;

  @ApiProperty({ example: 400, description: 'Gram amount', minimum: 1 })
  @IsInt()
  @IsPositive()
  gram!: number;

  @ApiProperty({ example: 1, description: 'Package unit count', minimum: 1 })
  @IsInt()
  @IsPositive()
  pieces!: number;

  @ApiProperty({ example: 16, description: 'Total servings', minimum: 1 })
  @IsInt()
  @IsPositive()
  totalServings!: number;

  @ApiProperty({
    example: 549.9,
    description: 'Regular sale price (₺)',
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalPrice!: number;

  @ApiPropertyOptional({
    example: 499.9,
    description:
      'Discounted sale price (₺). When set, must be strictly less than totalPrice.',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @ValidateIf((dto: CreateVariantDto) => dto.discountedPrice !== undefined)
  discountedPrice?: number;

  @ApiProperty({
    example: 34.37,
    description: 'Price per serving (₺)',
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  pricePerServing!: number;

  @ApiProperty({
    example: 'media/products/whey-protein-chocolate.jpg',
    description: 'Product image relative path',
  })
  @IsString()
  @IsNotEmpty()
  photoSrc!: string;

  @ApiPropertyOptional({
    example: true,
    description: "Admin's sale open/close toggle (default: true)",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({
    example: 50,
    description: 'Stock quantity (default: 0)',
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  stockQuantity?: number;
}
