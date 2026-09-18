import { ApiProperty } from '@nestjs/swagger';

export class ContactSubmitResponseDto {
  @ApiProperty({
    example: 'f93d3950-e14b-4b2e-a579-30ec6071efc5',
    description: 'Oluşturulan iletişim mesajı benzersiz kimliği (UUID)',
  })
  id!: string;

  @ApiProperty({
    example: 'Mesajınız başarıyla iletildi. En kısa sürede dönüş yapılacaktır.',
    description: 'Kullanıcıya gösterilecek başarı mesajı',
  })
  message!: string;
}

export class ContactMessageResponseDto {
  @ApiProperty({
    example: 'f93d3950-e14b-4b2e-a579-30ec6071efc5',
    description: 'İletişim mesajı benzersiz kimliği (UUID)',
  })
  id!: string;

  @ApiProperty({
    example: 'Mehmet Demir',
    description: 'Gönderen ad soyad',
  })
  name!: string;

  @ApiProperty({
    example: 'mehmet@example.com',
    description: 'Gönderen e-posta adresi',
  })
  email!: string;

  @ApiProperty({
    example: 'Siparişimle ilgili bilgi almak istiyorum.',
    description: 'İletişim mesaj metni',
  })
  message!: string;

  @ApiProperty({
    example: false,
    description: 'Yetkili tarafından incelendi / yanıtlandı durumu',
  })
  handled!: boolean;

  @ApiProperty({
    example: '2026-03-15T12:00:00.000Z',
    description: 'Mesaj oluşturulma tarihi (ISO 8601)',
  })
  created_at!: string;
}

export class ContactListResponseDto {
  @ApiProperty({
    example: 15,
    description: 'Filtreye uyan toplam mesaj sayısı',
  })
  count!: number;

  @ApiProperty({
    type: [ContactMessageResponseDto],
    description: 'İletişim mesajları listesi',
  })
  results!: ContactMessageResponseDto[];
}
