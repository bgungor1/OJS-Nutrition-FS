import { ApiProperty } from '@nestjs/swagger';

export class SuccessIdResponseDto {
  @ApiProperty({
    example: 'f8b1c4a0-1111-2222-3333-444455556666',
    description: 'Silinen veya işlenen kaydın benzersiz kimliği (UUID)',
  })
  id!: string;
}
