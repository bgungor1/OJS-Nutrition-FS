import { ApiProperty } from '@nestjs/swagger';

export class SuccessMessageDto {
  @ApiProperty({
    example: 'İşlem başarıyla tamamlandı.',
    description: 'İnsan tarafından okunabilir başarı mesajı',
  })
  message!: string;
}
