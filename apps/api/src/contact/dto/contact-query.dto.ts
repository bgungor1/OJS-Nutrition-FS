import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CONTACT_PAGINATION } from '../contact.constants';

export class ContactQueryDto {
  @ApiPropertyOptional({
    description: 'Mesajın durumuna göre filtreleme (incelendi / incelenmedi)',
    example: false,
  })
  @IsOptional()
  @Transform(
    ({
      obj,
      key,
      value,
    }: {
      obj: Record<string, unknown>;
      key: string;
      value: unknown;
    }) => {
      const raw = obj && obj[key] !== undefined ? obj[key] : value;
      if (raw === 'false' || raw === false || raw === 0 || raw === '0')
        return false;
      if (raw === 'true' || raw === true || raw === 1 || raw === '1')
        return true;
      return raw;
    },
  )
  @IsBoolean({ message: 'handled alanı boolean (true/false) olmalıdır.' })
  handled?: boolean;

  @ApiPropertyOptional({
    description: 'Sayfa başına getirilecek mesaj sayısı',
    default: CONTACT_PAGINATION.DEFAULT_LIMIT,
    minimum: 1,
    maximum: CONTACT_PAGINATION.MAX_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit tam sayı olmalıdır.' })
  @Min(1, { message: 'Limit en az 1 olmalıdır.' })
  @Max(CONTACT_PAGINATION.MAX_LIMIT, {
    message: `Limit en fazla ${CONTACT_PAGINATION.MAX_LIMIT} olabilir.`,
  })
  limit?: number;

  @ApiPropertyOptional({
    description: 'Atlanacak mesaj sayısı (offset)',
    default: CONTACT_PAGINATION.DEFAULT_OFFSET,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Offset tam sayı olmalıdır.' })
  @Min(0, { message: 'Offset 0 veya pozitif olmalıdır.' })
  offset?: number;
}
