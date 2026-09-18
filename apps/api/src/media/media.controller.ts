import {
  Controller,
  Post,
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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { MediaUploadResponse } from './interfaces/media-upload-response.interface';
import { MEDIA_MAX_FILE_SIZE, MEDIA_RATE_LIMIT } from './media.constants';
import { MediaService } from './media.service';

@ApiTags('media')
@ApiBearerAuth()
@Roles('admin')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) { }

  @Post('upload')
  @ApiOperation({
    summary: 'Güvenli görsel yükleme (Yalnızca Admin)',
    description:
      'Görselleri magic bytes ve MIME doğrulaması yaparak sunucuya kaydeder. SVG kesinlikle reddedilir.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Yüklenecek görsel (JPEG, PNG veya WEBP, maksimum 5MB)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Görsel başarıyla yüklendi',
    type: MediaUploadResponse,
  })
  @ApiResponse({
    status: 400,
    description:
      'Geçersiz dosya boyutu (maks 5MB), geçersiz format veya SVG engeli',
  })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  @ApiResponse({
    status: 403,
    description: 'Yetersiz yetki (Yalnızca admin erişebilir)',
  })
  @ApiResponse({
    status: 429,
    description: 'Hız sınırı aşıldı (Dakikada en fazla 10 yükleme)',
  })
  @Throttle({
    default: {
      limit: MEDIA_RATE_LIMIT.LIMIT,
      ttl: MEDIA_RATE_LIMIT.TTL,
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MEDIA_MAX_FILE_SIZE },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: Request,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<MediaUploadResponse> {
    const clientIp = req.ip || req.socket?.remoteAddress;
    return this.mediaService.uploadFile(file, clientIp, user?.id);
  }
}
