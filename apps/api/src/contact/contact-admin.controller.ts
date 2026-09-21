import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { Role } from '@prisma/client';
import { Roles } from '../common';
import { ErrorResponseDto, SuccessIdResponseDto } from '../common/dto';
import {
  ContactListResponseDto,
  ContactMessageResponseDto,
  ContactQueryDto,
  UpdateContactDto,
} from './dto';
import { ContactListResponse, ContactMessageResponse } from './interfaces';
import { ContactService } from './contact.service';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.admin)
@Controller('contact')
export class ContactAdminController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
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
