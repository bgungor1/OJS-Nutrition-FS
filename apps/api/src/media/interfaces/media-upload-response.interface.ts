import { ApiProperty } from '@nestjs/swagger';

export class MediaUploadResponse {
  @ApiProperty({
    example: 'media/uploads/550e8400-e29b-41d4-a716-446655440000.jpg',
    description: 'Statik göreli dosya yolu',
  })
  photo_src!: string;

  @ApiProperty({
    example:
      'http://localhost:3000/media/uploads/550e8400-e29b-41d4-a716-446655440000.jpg',
    description: 'Doğrudan erişilebilir tam medya URL adresi',
  })
  url!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000.jpg',
    description: 'Sistem tarafından üretilen güvenli dosya adı',
  })
  filename!: string;

  @ApiProperty({
    example: 102400,
    description: 'Dosya boyutu (bayt)',
  })
  size!: number;

  @ApiProperty({
    example: 'image/jpeg',
    description: 'Doğrulanmış MIME türü',
  })
  mimetype!: string;
}
