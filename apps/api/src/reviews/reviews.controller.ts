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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';
import { AuthenticatedUser, CurrentUser, Public, Roles } from '../common';
import { ErrorResponseDto } from '../common/dto';
import { REVIEW_RATE_LIMIT } from './reviews.constants';
import {
  CreateReviewDto,
  ReviewQueryDto,
  ApiReviewDto,
  DeletedIdResponseDto,
  PaginatedReviewsResponseDto,
} from './dto';
import { ApiReview, PaginatedReviewsResponse } from './interfaces';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@Controller('products/:slug/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Ürüne ait onaylı/genel yorumları ve puan istatistiklerini listeler',
    description:
      'rating, sortBy ve sayfalama parametreleri (limit, offset) desteklenir. Stats alanı tüm zamanların istatistiklerini içerir.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Ürün benzersiz URL slug değeri',
    example: 'whey-protein-1000g',
  })
  @ApiResponse({
    status: 200,
    description: 'Yorum listesi ve istatistikler başarıyla getirildi.',
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
    default: {
      limit: REVIEW_RATE_LIMIT.LIMIT,
      ttl: REVIEW_RATE_LIMIT.TTL,
    },
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Giriş yapmış kullanıcı adına ürüne yeni değerlendirme ekler',
    description:
      'Kullanıcı başına ürün başına bir yorum sınırı uygulanır. Doğrulanmış alıcı etiketleri sipariş geçmişine göre otomatik atanır.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Ürün benzersiz URL slug değeri',
    example: 'whey-protein-1000g',
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
    description: 'Oturum açılmamış veya token geçersiz.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Ürün veya kullanıcı bulunamadı.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Bu ürün için zaten bir değerlendirme yapılmış.',
    type: ErrorResponseDto,
  })
  async create(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateReviewDto,
  ): Promise<ApiReview> {
    return this.reviewsService.create(slug, user.id, dto);
  }

  @Public()
  @Post(':id/helpful')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Yorumun faydalı bulunma sayacını 1 artırır',
    description: 'Oturum gerektirmez. Rate-limit uygulanır.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Ürün benzersiz URL slug değeri',
    example: 'whey-protein-1000g',
  })
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
  @ApiOperation({
    summary:
      'Yorumu siler ve ürünün ortalama puanını günceller (Admin Moderasyon)',
    description:
      'Yorum silinince product.commentCount ve product.averageStar aynı transaction içinde güncellenir.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Ürün benzersiz URL slug değeri',
    example: 'whey-protein-1000g',
  })
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
    description: 'Yetkisiz erişim — Admin rolü gereklidir.',
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
