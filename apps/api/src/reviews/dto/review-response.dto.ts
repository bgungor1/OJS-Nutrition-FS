import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RatingDistributionDto {
  @ApiProperty({ example: 5, description: '1 yıldız yorum sayısı' })
  '1'!: number;

  @ApiProperty({ example: 3, description: '2 yıldız yorum sayısı' })
  '2'!: number;

  @ApiProperty({ example: 8, description: '3 yıldız yorum sayısı' })
  '3'!: number;

  @ApiProperty({ example: 22, description: '4 yıldız yorum sayısı' })
  '4'!: number;

  @ApiProperty({ example: 42, description: '5 yıldız yorum sayısı' })
  '5'!: number;
}

export class ReviewStatsDto {
  @ApiProperty({ example: 80, description: 'Toplam yorum sayısı' })
  total_reviews!: number;

  @ApiProperty({ example: 4.3, description: 'Ortalama puan (1-5)' })
  average_rating!: number;

  @ApiProperty({ type: RatingDistributionDto })
  rating_distribution!: RatingDistributionDto;

  @ApiProperty({ example: 55, description: 'Doğrulanmış alıcı yorum sayısı' })
  verified_reviews!: number;
}

export class ApiReviewDto {
  @ApiProperty({ example: 'f8b1c4a0-1111-2222-3333-444455556666' })
  id!: string;

  @ApiProperty({ example: 'a1b2c3d4-5678-90ef-abcd-ef1234567890' })
  product_id!: string;

  @ApiProperty({ example: 'Ahmet Y.', description: 'Yorumcu görünen adı' })
  reviewer_name!: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  rating!: number;

  @ApiProperty({
    example: true,
    description: 'Doğrulanmış satın alma etiketi',
  })
  is_verified!: boolean;

  @ApiProperty({ example: 'Harika ürün!', description: 'Yorum başlığı' })
  title!: string;

  @ApiProperty({
    example: 'Beklentilerimi tamamen karşıladı...',
    description: 'Yorum metni',
  })
  text!: string;

  @ApiProperty({
    example: ['media/reviews/img1.jpg'],
    description: 'Yüklenen yorum fotoğrafları',
    type: [String],
  })
  images!: string[];

  @ApiProperty({ example: 12, description: 'Faydalı bulunan sayısı' })
  helpful_count!: number;

  @ApiProperty({ example: '2026-09-15T10:30:00.000Z' })
  created_at!: string;
}

export class PaginatedReviewsResponseDto {
  @ApiProperty({ example: 80, description: 'Toplam yorum sayısı' })
  count!: number;

  @ApiProperty({ type: [ApiReviewDto] })
  results!: ApiReviewDto[];

  @ApiProperty({ type: ReviewStatsDto })
  stats!: ReviewStatsDto;
}

export class DeletedIdResponseDto {
  @ApiProperty({
    example: 'f8b1c4a0-1111-2222-3333-444455556666',
    description: 'Silinen kayıt ID',
  })
  id!: string;
}

export class HelpfulCountResponseDto {
  @ApiPropertyOptional({
    example: 13,
    description: 'Yeni faydalı bulunma sayısı',
  })
  helpful_count?: number;
}
