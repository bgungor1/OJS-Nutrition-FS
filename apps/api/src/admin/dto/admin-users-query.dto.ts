import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ADMIN_PAGINATION } from '../admin.constants';

export class AdminUsersQueryDto {
  @ApiPropertyOptional({
    description: 'Sayfa başına dönecek kullanıcı sayısı',
    default: ADMIN_PAGINATION.DEFAULT_LIMIT,
    minimum: 1,
    maximum: ADMIN_PAGINATION.MAX_LIMIT,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit tam sayı olmalıdır.' })
  @Min(1, { message: 'Limit en az 1 olmalıdır.' })
  @Max(ADMIN_PAGINATION.MAX_LIMIT, {
    message: `Limit en fazla ${ADMIN_PAGINATION.MAX_LIMIT} olabilir.`,
  })
  limit?: number = ADMIN_PAGINATION.DEFAULT_LIMIT;

  @ApiPropertyOptional({
    description: 'Atlanacak kullanıcı sayısı (offset)',
    default: ADMIN_PAGINATION.DEFAULT_OFFSET,
    minimum: 0,
    example: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Offset tam sayı olmalıdır.' })
  @Min(0, { message: 'Offset en az 0 olmalıdır.' })
  offset?: number = ADMIN_PAGINATION.DEFAULT_OFFSET;

  @ApiPropertyOptional({
    description: 'Ad, soyad veya e-posta ile arama',
    example: 'Ahmet',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'Arama metni karakter dizisi olmalıdır.' })
  search?: string;

  @ApiPropertyOptional({
    description: 'Kullanıcı rolüne göre filtreleme (customer veya admin)',
    enum: Role,
    example: Role.customer,
  })
  @IsOptional()
  @IsEnum(Role, {
    message: 'Geçersiz rol değeri. (customer veya admin olmalıdır)',
  })
  role?: Role;
}
