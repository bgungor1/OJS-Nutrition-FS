import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
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
import { CurrentUser, AuthenticatedUser } from '../common';
import { ErrorResponseDto } from '../common/dto';
import { AddressesService } from './addresses.service';
import { AddressesQueryDto, CreateAddressDto, UpdateAddressDto } from './dto';
import {
  AddressResponseDto,
  DeleteAddressResponseDto,
  PaginatedAddressesResponseDto,
} from './interfaces';

@ApiTags('addresses')
@ApiBearerAuth()
@Controller('users/addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Giriş yapmış kullanıcının adreslerini listeler' })
  @ApiResponse({
    status: 200,
    description: 'Adres listesi başarıyla getirildi.',
    type: PaginatedAddressesResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim — Bearer token eksik veya geçersiz.',
    type: ErrorResponseDto,
  })
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AddressesQueryDto,
  ): Promise<PaginatedAddressesResponseDto> {
    return this.addressesService.list(user.id, query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Belirli bir adresin detaylarını getirir' })
  @ApiParam({
    name: 'id',
    description: 'Adres benzersiz UUID değeri',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Adres detayları başarıyla getirildi.',
    type: AddressResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz UUID parametresi.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim — Bearer token eksik veya geçersiz.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Adres bulunamadı.',
    type: ErrorResponseDto,
  })
  async getById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AddressResponseDto> {
    return this.addressesService.getById(user.id, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Kullanıcı için yeni bir adres oluşturur' })
  @ApiResponse({
    status: 201,
    description: 'Adres başarıyla oluşturuldu.',
    type: AddressResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz veri veya eşleşmeyen coğrafi hiyerarşi.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim — Bearer token eksik veya geçersiz.',
    type: ErrorResponseDto,
  })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAddressDto,
  ): Promise<AddressResponseDto> {
    return this.addressesService.create(user.id, dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mevcut bir adresi günceller' })
  @ApiParam({
    name: 'id',
    description: 'Adres benzersiz UUID değeri',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Adres başarıyla güncellendi.',
    type: AddressResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz veri veya eşleşmeyen coğrafi hiyerarşi.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim — Bearer token eksik veya geçersiz.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Adres bulunamadı.',
    type: ErrorResponseDto,
  })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAddressDto,
  ): Promise<AddressResponseDto> {
    return this.addressesService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mevcut bir adresi siler' })
  @ApiParam({
    name: 'id',
    description: 'Adres benzersiz UUID değeri',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Adres başarıyla silindi.',
    type: DeleteAddressResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz UUID parametresi.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim — Bearer token eksik veya geçersiz.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Adres bulunamadı.',
    type: ErrorResponseDto,
  })
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DeleteAddressResponseDto> {
    return this.addressesService.delete(user.id, id);
  }
}
