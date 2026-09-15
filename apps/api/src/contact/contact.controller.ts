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
import { CONTACT_RATE_LIMIT } from './contact.constants';
import { ContactQueryDto, CreateContactDto, UpdateContactDto } from './dto';
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
  })
  @ApiResponse({
    status: 201,
    description: 'Mesaj başarıyla alındı.',
  })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz DTO girdi parametreleri.',
  })
  @ApiResponse({
    status: 429,
    description: 'İstek limiti aşıldı (IP başına dakikada maks 5 istek).',
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
  })
  @ApiResponse({
    status: 403,
    description: 'Yetkisiz erişim — Admin rolü gereklidir.',
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
  })
  @ApiResponse({
    status: 403,
    description: 'Yetkisiz erişim — Admin rolü gereklidir.',
  })
  @ApiResponse({
    status: 404,
    description: 'İletişim mesajı bulunamadı.',
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
  })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz DTO girdisi.',
  })
  @ApiResponse({
    status: 403,
    description: 'Yetkisiz erişim — Admin rolü gereklidir.',
  })
  @ApiResponse({
    status: 404,
    description: 'İletişim mesajı bulunamadı.',
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
  })
  @ApiResponse({
    status: 403,
    description: 'Yetkisiz erişim — Admin rolü gereklidir.',
  })
  @ApiResponse({
    status: 404,
    description: 'İletişim mesajı bulunamadı.',
  })
  async delete(@Param('id') id: string): Promise<{ id: string }> {
    return this.contactService.delete(id);
  }
}
