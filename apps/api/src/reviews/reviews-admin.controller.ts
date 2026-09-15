import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@ApiBearerAuth()
@Roles(Role.admin)
@Controller('reviews')
export class ReviewsAdminController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Yorumu siler ve ürünün ortalama puanını günceller (Admin Moderasyon)',
  })
  @ApiParam({
    name: 'id',
    description: 'Silinecek yorum ID',
    example: 'f8b1c4a0-1111-2222-3333-444455556666',
  })
  @ApiResponse({
    status: 200,
    description: 'Yorum başarıyla silindi.',
  })
  @ApiResponse({
    status: 403,
    description: 'Yetkisiz erişim — Admin rolü gereklidir.',
  })
  @ApiResponse({
    status: 404,
    description: 'Yorum bulunamadı.',
  })
  async delete(@Param('id') id: string): Promise<{ id: string }> {
    return this.reviewsService.delete(id);
  }
}
