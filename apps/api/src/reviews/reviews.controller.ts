import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import type { Request } from 'express';
import { AuthenticatedUser, CurrentUser, Public, Roles } from '../common';
import { ErrorResponseDto } from '../common/dto';
import { MediaUploadResponse } from '../media/interfaces/media-upload-response.interface';
import {
  MEDIA_MAX_FILE_SIZE,
  MEDIA_RATE_LIMIT,
} from '../media/media.constants';
import {
  ApiReviewDto,
  CreateReviewDto,
  DeletedIdResponseDto,
  PaginatedReviewsResponseDto,
  ReviewQueryDto,
} from './dto';
import { ApiReview, PaginatedReviewsResponse } from './interfaces';
import { REVIEW_RATE_LIMIT } from './reviews.constants';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@ApiParam({
  name: 'slug',
  description: 'Ürün benzersiz URL slug değeri',
  example: 'whey-protein-1000g',
})
@Controller('products/:slug/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ürüne ait onaylı yorumları ve puan istatistiklerini listeler',
  })
  @ApiResponse({
    status: 200,
    description: 'Yorum listesi ve istatistikler getirildi.',
    type: PaginatedReviewsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ürün bulunamadı.',
    type: ErrorResponseDto,
  })
  async list(
    @Param('slug') slug: string,
    @Query() query: ReviewQueryDto,
  ): Promise<PaginatedReviewsResponse> {
    return this.reviewsService.list(slug, query);
  }

  @Post()
  @ApiBearerAuth()
  @Throttle({
    default: { limit: REVIEW_RATE_LIMIT.LIMIT, ttl: REVIEW_RATE_LIMIT.TTL },
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Giriş yapmış kullanıcı adına ürüne yeni değerlendirme ekler',
  })
  @ApiResponse({
    status: 201,
    description: 'Yorum başarıyla kaydedildi.',
    type: ApiReviewDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz DTO girdisi.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ürün veya kullanıcı bulunamadı.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Bu ürün için zaten değerlendirme yapılmış.',
    type: ErrorResponseDto,
  })
  async create(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateReviewDto,
  ): Promise<ApiReview> {
    return this.reviewsService.create(slug, user.id, dto);
  }

  @Post('upload')
  @ApiBearerAuth()
  @Throttle({
    default: { limit: MEDIA_RATE_LIMIT.LIMIT, ttl: MEDIA_RATE_LIMIT.TTL },
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Değerlendirme için görsel yükler' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Görsel (maks 5MB, JPEG/PNG/WEBP)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Görsel başarıyla yüklendi.',
    type: MediaUploadResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz dosya boyutu veya formatı.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ürün bulunamadı.',
    type: ErrorResponseDto,
  })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MEDIA_MAX_FILE_SIZE } }),
  )
  async uploadImage(
    @Param('slug') slug: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: Request,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MediaUploadResponse> {
    const clientIp = req.ip || req.socket?.remoteAddress;
    return this.reviewsService.uploadImage(slug, file, clientIp, user.id);
  }

  @Public()
  @Post(':id/helpful')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Yorumun faydalı bulunma sayacını 1 artırır' })
  @ApiParam({
    name: 'id',
    description: 'Yorum ID',
    example: 'f8b1c4a0-1111-2222-3333-444455556666',
  })
  @ApiResponse({
    status: 200,
    description: 'Faydalı sayısı başarıyla artırıldı.',
    type: ApiReviewDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ürün veya yorum bulunamadı.',
    type: ErrorResponseDto,
  })
  async markHelpful(
    @Param('slug') slug: string,
    @Param('id') id: string,
  ): Promise<ApiReview> {
    return this.reviewsService.markHelpful(slug, id);
  }

  @Delete(':id')
  @Roles(Role.admin)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Yorumu siler ve ürün ortalama puanını günceller' })
  @ApiParam({
    name: 'id',
    description: 'Yorum ID',
    example: 'f8b1c4a0-1111-2222-3333-444455556666',
  })
  @ApiResponse({
    status: 200,
    description: 'Yorum başarıyla silindi.',
    type: DeletedIdResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Admin yetkisi gereklidir.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Yorum bulunamadı.',
    type: ErrorResponseDto,
  })
  async delete(@Param('id') id: string): Promise<{ id: string }> {
    return this.reviewsService.delete(id);
  }
}
