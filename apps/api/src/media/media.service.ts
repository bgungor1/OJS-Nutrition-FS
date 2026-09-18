import {
  BadRequestException,
  Injectable,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fs from 'node:fs';
import path from 'node:path';
import { AppConfig } from '../config/configuration';
import { AuditEvent } from '../common/audit/audit-event.enum';
import { SecurityAuditService } from '../common/audit/security-audit.service';
import { MediaValidatorHelper } from './helpers/media-validator.helper';
import { MediaUploadResponse } from './interfaces/media-upload-response.interface';
import {
  MEDIA_ERROR_MESSAGES,
  MEDIA_MAX_FILE_SIZE,
  MEDIA_UPLOADS_SUBDIR,
} from './media.constants';

@Injectable()
export class MediaService implements OnModuleInit {
  private readonly storagePath: string;
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService<AppConfig, true>,
    @Optional() private readonly auditService?: SecurityAuditService,
  ) {
    const mediaConfig = this.configService.get('media', { infer: true });
    const rawStoragePath = mediaConfig.storagePath;

    this.storagePath = path.isAbsolute(rawStoragePath)
      ? rawStoragePath
      : path.join(process.cwd(), rawStoragePath);

    this.baseUrl = mediaConfig.baseUrl.replace(/\/+$/, '');
  }

  onModuleInit(): void {
    const uploadDir = path.join(this.storagePath, MEDIA_UPLOADS_SUBDIR);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  }

  async uploadFile(
    file?: Express.Multer.File,
    clientIp?: string,
    userId?: string,
  ): Promise<MediaUploadResponse> {
    if (!file || !file.buffer) {
      this.auditService?.warn(AuditEvent.MEDIA_REJECTED, {
        ip: clientIp,
        userId,
        details: { reason: 'Eksik dosya gövdesi' },
      });
      throw new BadRequestException(MEDIA_ERROR_MESSAGES.NO_FILE);
    }

    if (file.size > MEDIA_MAX_FILE_SIZE) {
      this.auditService?.warn(AuditEvent.MEDIA_REJECTED, {
        ip: clientIp,
        userId,
        details: {
          originalName: file.originalname,
          size: file.size,
          reason: 'Dosya boyutu 5MB sınırını aştı',
        },
      });
      throw new BadRequestException(MEDIA_ERROR_MESSAGES.FILE_TOO_LARGE);
    }

    if (
      MediaValidatorHelper.isSvg(file.buffer, file.originalname, file.mimetype)
    ) {
      this.auditService?.warn(AuditEvent.MEDIA_REJECTED, {
        ip: clientIp,
        userId,
        details: {
          originalName: file.originalname,
          reason: 'SVG formatı güvenlik gerekçesiyle engellendi',
        },
      });
      throw new BadRequestException(MEDIA_ERROR_MESSAGES.SVG_PROHIBITED);
    }

    const validatedMedia = MediaValidatorHelper.validateMagicBytes(file.buffer);
    if (!validatedMedia) {
      this.auditService?.warn(AuditEvent.MEDIA_REJECTED, {
        ip: clientIp,
        userId,
        details: {
          originalName: file.originalname,
          declaredMime: file.mimetype,
          reason: 'Magic bytes MIME doğrulaması başarısız',
        },
      });
      throw new BadRequestException(MEDIA_ERROR_MESSAGES.INVALID_FORMAT);
    }

    const filename = MediaValidatorHelper.generateSafeFilename(
      validatedMedia.extension,
    );
    const targetDir = path.join(this.storagePath, MEDIA_UPLOADS_SUBDIR);
    const targetFilePath = path.join(targetDir, filename);

    MediaValidatorHelper.assertSafePath(this.storagePath, targetFilePath);

    await fs.promises.mkdir(targetDir, { recursive: true });
    await fs.promises.writeFile(targetFilePath, file.buffer);

    const photoSrc = path.posix.join('media', MEDIA_UPLOADS_SUBDIR, filename);
    const fullUrl = `${this.baseUrl}/${MEDIA_UPLOADS_SUBDIR}/${filename}`;

    this.auditService?.info(AuditEvent.MEDIA_UPLOADED, {
      ip: clientIp,
      userId,
      resourceId: filename,
      details: {
        originalName: file.originalname,
        size: file.size,
        mimeType: validatedMedia.mimeType,
        photoSrc,
      },
    });

    return {
      photo_src: photoSrc,
      url: fullUrl,
      filename,
      size: file.size,
      mimetype: validatedMedia.mimeType,
    };
  }
}
