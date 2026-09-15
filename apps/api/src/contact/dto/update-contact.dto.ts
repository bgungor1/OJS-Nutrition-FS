import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateContactDto {
  @ApiProperty({
    description: 'İletişim mesajının incelendi/çözüldü durumu',
    example: true,
  })
  @IsNotEmpty({ message: 'handled alanı boş bırakılamaz.' })
  @IsBoolean({ message: 'handled alanı boolean (true/false) olmalıdır.' })
  handled!: boolean;
}
