import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { OrderStatus } from '@prisma/client';
import { PAGINATION } from '../../common/constants';

const ALLOWED_ORDER_STATUSES = Object.values(OrderStatus);

export class OrderQueryDto {
  @ApiPropertyOptional({
    description:
      'Sayfa başına dönecek sipariş adedi (varsayılan: 20, max: 100)',
    default: PAGINATION.DEFAULT_LIMIT,
    minimum: 1,
    maximum: PAGINATION.MAX_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit bir tam sayı olmalıdır.' })
  @Min(1, { message: 'limit en az 1 olmalıdır.' })
  @Max(PAGINATION.MAX_LIMIT, {
    message: `limit en fazla ${PAGINATION.MAX_LIMIT} olabilir.`,
  })
  limit: number = PAGINATION.DEFAULT_LIMIT;

  @ApiPropertyOptional({
    description: 'Atlanacak sipariş adedi (offset)',
    default: PAGINATION.DEFAULT_OFFSET,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'offset bir tam sayı olmalıdır.' })
  @Min(0, { message: 'offset negatif olamaz.' })
  offset: number = PAGINATION.DEFAULT_OFFSET;

  @ApiPropertyOptional({
    description: 'Sipariş durumuna göre filtrele',
    enum: OrderStatus,
  })
  @IsOptional()
  @IsIn(ALLOWED_ORDER_STATUSES, {
    message: `status yalnızca şu değerlerden biri olabilir: ${ALLOWED_ORDER_STATUSES.join(', ')}.`,
  })
  status?: OrderStatus;
}
