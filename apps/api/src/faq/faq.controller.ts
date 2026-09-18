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
import { Role } from '@prisma/client';
import { Public, Roles } from '../common';
import { ErrorResponseDto, SuccessIdResponseDto } from '../common/dto';
import {
  CreateFaqDto,
  FaqItemResponseDto,
  FaqQueryDto,
  UpdateFaqDto,
} from './dto';
import { ApiFaqItem } from './interfaces';
import { FaqService } from './faq.service';

@ApiTags('faq')
@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sıkça sorulan soruları kategoriye göre veya tümüyle listeler',
  })
  @ApiResponse({
    status: 200,
    description: 'SSS listesi başarıyla getirildi.',
    type: [FaqItemResponseDto],
  })
  async findAll(@Query() query: FaqQueryDto): Promise<ApiFaqItem[]> {
    return this.faqService.findAll(query);
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Tekil SSS maddesini getirir',
  })
  @ApiParam({
    name: 'id',
    description: 'SSS madde ID',
    example: 'd3b07384-d113-4ec4-927a-8ee0759f2762',
  })
  @ApiResponse({
    status: 200,
    description: 'SSS maddesi başarıyla getirildi.',
    type: FaqItemResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'SSS maddesi bulunamadı.',
    type: ErrorResponseDto,
  })
  async findById(@Param('id') id: string): Promise<ApiFaqItem> {
    return this.faqService.findById(id);
  }

  @Post()
  @Roles(Role.admin)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Yeni SSS maddesi ekler (Admin)',
  })
  @ApiResponse({
    status: 201,
    description: 'SSS maddesi başarıyla oluşturuldu.',
    type: FaqItemResponseDto,
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
  async create(@Body() dto: CreateFaqDto): Promise<ApiFaqItem> {
    return this.faqService.create(dto);
  }

  @Put(':id')
  @Roles(Role.admin)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'SSS maddesini günceller (Admin)',
  })
  @ApiParam({
    name: 'id',
    description: 'Güncellenecek SSS madde ID',
    example: 'd3b07384-d113-4ec4-927a-8ee0759f2762',
  })
  @ApiResponse({
    status: 200,
    description: 'SSS maddesi başarıyla güncellendi.',
    type: FaqItemResponseDto,
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
    description: 'SSS maddesi bulunamadı.',
    type: ErrorResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFaqDto,
  ): Promise<ApiFaqItem> {
    return this.faqService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.admin)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'SSS maddesini siler (Admin)',
  })
  @ApiParam({
    name: 'id',
    description: 'Silinecek SSS madde ID',
    example: 'd3b07384-d113-4ec4-927a-8ee0759f2762',
  })
  @ApiResponse({
    status: 200,
    description: 'SSS maddesi başarıyla silindi.',
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
    description: 'SSS maddesi bulunamadı.',
    type: ErrorResponseDto,
  })
  async delete(@Param('id') id: string): Promise<{ id: string }> {
    return this.faqService.delete(id);
  }
}
