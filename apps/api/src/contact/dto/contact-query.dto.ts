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
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true' || value === true || value === 1 || value === '1')
      return true;
    if (value === 'false' || value === false || value === 0 || value === '0')
      return false;
    return value;
  })
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
