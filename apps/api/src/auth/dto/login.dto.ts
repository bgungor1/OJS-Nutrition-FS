import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  /** Frontend geçmişte `username` gönderiyordu; alan e-posta taşır. */
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ example: 'Passw0rd' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
