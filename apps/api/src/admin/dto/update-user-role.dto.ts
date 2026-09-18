import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({
    description: 'Kullanıcıya atanacak yeni rol',
    enum: Role,
    example: Role.admin,
  })
  @IsEnum(Role, {
    message: 'Geçersiz rol değeri. (customer veya admin olmalıdır)',
  })
  role!: Role;
}
