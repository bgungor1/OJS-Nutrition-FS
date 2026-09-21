import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../common';
import { ErrorResponseDto } from '../common/dto';
import { CONTACT_RATE_LIMIT } from './contact.constants';
import { ContactSubmitResponseDto, CreateContactDto } from './dto';
import { ContactSubmitResponse } from './interfaces';
import { ContactService } from './contact.service';

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Public()
  @Throttle({
    default: {
      limit: CONTACT_RATE_LIMIT.LIMIT,
      ttl: CONTACT_RATE_LIMIT.TTL,
    },
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'İletişim formu mesajı gönderir (Public, IP rate-limited)',
    description:
      'Yalnızca anonim kullanıcılar dahil herkese açıktır. IP başına dakikada 5 istek limit uygulanır.',
  })
  @ApiResponse({
    status: 201,
    description: 'Mesaj başarıyla alındı.',
    type: ContactSubmitResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz DTO girdi parametreleri.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'İstek limiti aşıldı (IP başına dakikada maks 5 istek).',
    type: ErrorResponseDto,
  })
  async submit(@Body() dto: CreateContactDto): Promise<ContactSubmitResponse> {
    return this.contactService.submit(dto);
  }
}
