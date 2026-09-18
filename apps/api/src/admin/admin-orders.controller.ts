import {
  Body,
  Controller,
  Get,
  Ip,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { AdminOrdersService } from './admin-orders.service';
import {
  AdminOrderDetailResponseDto,
  AdminOrdersPaginatedResponseDto,
  AdminOrdersQueryDto,
  UpdateAdminOrderStatusDto,
} from './dto';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.admin)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly adminOrdersService: AdminOrdersService) {}

  @Get()
  @ApiOperation({
    summary: 'Siparişleri listele',
    description:
      'Admin paneli için filtrelenebilir, aranabilir ve sayfalanmış sipariş listesini döner.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sipariş listesi başarıyla getirildi.',
    type: AdminOrdersPaginatedResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim (token eksik veya geçersiz).',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Erişim engellendi (admin rolü gereklidir).',
    type: ErrorResponseDto,
  })
  async listOrders(
    @Query() query: AdminOrdersQueryDto,
  ): Promise<AdminOrdersPaginatedResponseDto> {
    return this.adminOrdersService.listOrders(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Sipariş detayını getir',
    description:
      'Belirtilen siparişin müşteri bilgileri, ürün kalemleri, ödeme ve adres detaylarını döner.',
  })
  @ApiParam({
    name: 'id',
    description: 'Sipariş UUID',
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  })
  @ApiResponse({
    status: 200,
    description: 'Sipariş detayı başarıyla getirildi.',
    type: AdminOrderDetailResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim (token eksik veya geçersiz).',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Erişim engellendi (admin rolü gereklidir).',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Sipariş bulunamadı.',
    type: ErrorResponseDto,
  })
  async getOrderById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AdminOrderDetailResponseDto> {
    return this.adminOrdersService.getOrderById(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Sipariş durumunu güncelle',
    description:
      'Siparişin durumunu günceller. İptal veya iade durumunda ürün stoklarını otomatik geri yükler ve denetim günlüğü kaydeder.',
  })
  @ApiParam({
    name: 'id',
    description: 'Sipariş UUID',
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  })
  @ApiResponse({
    status: 200,
    description: 'Sipariş durumu başarıyla güncellendi.',
    type: AdminOrderDetailResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz sipariş durumu geçişi.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim (token eksik veya geçersiz).',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Erişim engellendi (admin rolü gereklidir).',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Sipariş bulunamadı.',
    type: ErrorResponseDto,
  })
  async updateOrderStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdminOrderStatusDto,
    @CurrentUser() user: AuthenticatedUser,
    @Ip() ip: string,
  ): Promise<AdminOrderDetailResponseDto> {
    return this.adminOrdersService.updateOrderStatus(id, dto, user.id, ip);
  }
}
