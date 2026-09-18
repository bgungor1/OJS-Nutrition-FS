import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ADMIN_PAGINATION } from '../admin.constants';

export const ADMIN_ORDER_SORT_VALUES = [
  'date_desc',
  'date_asc',
  'total_desc',
  'total_asc',
] as const;

export type AdminOrderSort = (typeof ADMIN_ORDER_SORT_VALUES)[number];

export class AdminOrdersQueryDto {
  @ApiPropertyOptional({
    description: 'Sayfa başına dönecek sipariş sayısı',
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
    description: 'Atlanacak sipariş sayısı (offset)',
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
    description: 'Sipariş numarası, müşteri adı/soyadı veya e-posta ile arama',
    example: 'OJS-2026',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'Arama metni karakter dizisi olmalıdır.' })
  search?: string;

  @ApiPropertyOptional({
    description: 'Sipariş durumuna göre filtreleme',
    enum: OrderStatus,
    example: OrderStatus.processing,
  })
  @IsOptional()
  @IsEnum(OrderStatus, {
    message: 'Geçersiz sipariş durumu.',
  })
  status?: OrderStatus;

  @ApiPropertyOptional({
    description:
      'Başlangıç tarihi (ISO 8601 formatında: YYYY-MM-DD veya tam ISO)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsISO8601(
    {},
    { message: 'Geçerli bir başlangıç tarihi (ISO 8601) giriniz.' },
  )
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Bitiş tarihi (ISO 8601 formatında: YYYY-MM-DD veya tam ISO)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsISO8601({}, { message: 'Geçerli bir bitiş tarihi (ISO 8601) giriniz.' })
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Sıralama kriteri',
    enum: ADMIN_ORDER_SORT_VALUES,
    default: 'date_desc',
    example: 'date_desc',
  })
  @IsOptional()
  @IsIn(ADMIN_ORDER_SORT_VALUES, {
    message: `Geçersiz sıralama değeri. İzin verilenler: ${ADMIN_ORDER_SORT_VALUES.join(', ')}`,
  })
  sort?: AdminOrderSort = 'date_desc';
}
