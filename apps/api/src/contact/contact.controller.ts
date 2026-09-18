import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import { Public, Roles } from '../common';
import { ErrorResponseDto, SuccessIdResponseDto } from '../common/dto';
import { CONTACT_RATE_LIMIT } from './contact.constants';
import {
  ContactListResponseDto,
  ContactMessageResponseDto,
  ContactQueryDto,
  ContactSubmitResponseDto,
  CreateContactDto,
  UpdateContactDto,
} from './dto';
import {
  ContactListResponse,
  ContactMessageResponse,
  ContactSubmitResponse,
} from './interfaces';
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

  @Get()
  @Roles(Role.admin)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'İletişim mesajlarını listeler (Admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'İletişim mesajları başarıyla listelendi.',
    type: ContactListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkilendirme başarısız.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Yetkisiz erişim — Admin rolü gereklidir.',
    type: ErrorResponseDto,
  })
  async findAll(@Query() query: ContactQueryDto): Promise<ContactListResponse> {
    return this.contactService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.admin)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Tekil iletişim mesajını getirir (Admin)',
  })
  @ApiParam({
    name: 'id',
    description: 'İletişim mesajı ID',
    example: 'f93d3950-e14b-4b2e-a579-30ec6071efc5',
  })
  @ApiResponse({
    status: 200,
    description: 'İletişim mesajı başarıyla getirildi.',
    type: ContactMessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkilendirme başarısız.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Yetkisiz erişim — Admin rolü gereklidir.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'İletişim mesajı bulunamadı.',
    type: ErrorResponseDto,
  })
  async findById(@Param('id') id: string): Promise<ContactMessageResponse> {
    return this.contactService.findById(id);
  }

  @Put(':id')
  @Roles(Role.admin)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'İletişim mesajının durumunu günceller (Admin)',
  })
  @ApiParam({
    name: 'id',
    description: 'Güncellenecek iletişim mesajı ID',
    example: 'f93d3950-e14b-4b2e-a579-30ec6071efc5',
  })
  @ApiResponse({
    status: 200,
    description: 'İletişim mesajı başarıyla güncellendi.',
    type: ContactMessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz DTO girdisi.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkilendirme başarısız.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Yetkisiz erişim — Admin rolü gereklidir.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'İletişim mesajı bulunamadı.',
    type: ErrorResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateContactDto,
  ): Promise<ContactMessageResponse> {
    return this.contactService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.admin)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'İletişim mesajını siler (Admin)',
  })
  @ApiParam({
    name: 'id',
    description: 'Silinecek iletişim mesajı ID',
    example: 'f93d3950-e14b-4b2e-a579-30ec6071efc5',
  })
  @ApiResponse({
    status: 200,
    description: 'İletişim mesajı başarıyla silindi.',
    type: SuccessIdResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkilendirme başarısız.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Yetkisiz erişim — Admin rolü gereklidir.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'İletişim mesajı bulunamadı.',
    type: ErrorResponseDto,
  })
  async delete(@Param('id') id: string): Promise<{ id: string }> {
    return this.contactService.delete(id);
  }
}
