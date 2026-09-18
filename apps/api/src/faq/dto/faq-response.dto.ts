import { ApiProperty } from '@nestjs/swagger';

export class FaqItemResponseDto {
  @ApiProperty({
    example: 'd3b07384-d113-4ec4-927a-8ee0759f2762',
    description: 'SSS kaydı benzersiz kimliği (UUID)',
  })
  id!: string;

  @ApiProperty({
    example: 'Siparişim ne zaman kargoya verilir?',
    description: 'Soru metni',
  })
  question!: string;

  @ApiProperty({
    example:
      "Hafta içi saat 16:00'ya kadar verilen siparişler aynı gün kargoya verilir.",
    description: 'Cevap metni',
  })
  answer!: string;

  @ApiProperty({
    example: 'Kargo ve Teslimat',
    description: 'Soru kategorisi',
  })
  category!: string;

  @ApiProperty({
    example: 1,
    description: 'Görüntülenme sıralama indeksi',
  })
  sort_order!: number;
}
