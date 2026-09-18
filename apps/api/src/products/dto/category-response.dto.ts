import { ApiProperty } from '@nestjs/swagger';

export class SubCategoryItemDto {
  @ApiProperty({ example: 'subcat-whey' })
  id!: string;

  @ApiProperty({ example: 'Whey Protein' })
  name!: string;

  @ApiProperty({ example: 'whey-protein' })
  slug!: string;

  @ApiProperty({ example: 'cat-protein' })
  categoryId!: string;
}

export class CategoryTreeDto {
  @ApiProperty({ example: 'cat-protein' })
  id!: string;

  @ApiProperty({ example: 'Protein' })
  name!: string;

  @ApiProperty({ example: 'protein' })
  slug!: string;

  @ApiProperty({ type: [SubCategoryItemDto] })
  subCategories!: SubCategoryItemDto[];
}
