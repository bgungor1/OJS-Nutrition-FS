import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { MediaService } from './media.service';

/**
 * BACKEND_PLAN §7 — @Roles('admin'):
 *  POST /media/upload  (multipart/form-data) -> { photo_src: 'media/...' }
 * Statik sunum: GET /media/** (ServeStaticModule, prefix'siz).
 */
@ApiTags('media')
@ApiBearerAuth()
@Roles('admin')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}
}
