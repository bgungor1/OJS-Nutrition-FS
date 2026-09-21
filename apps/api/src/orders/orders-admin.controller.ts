import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common';
import { ErrorResponseDto } from '../common/dto';
import { OrderDetailResponseDto, UpdateOrderStatusDto } from './dto';
import { OrderDetailResponse } from './interfaces';
import { OrdersService } from './orders.service';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.admin)
@Controller('orders')
export class OrdersAdminController {
  constructor(private readonly ordersService: OrdersService) {}

  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Sipariş durumunu günceller ve gerekirse stok iadesi yapar (Admin)',
    description:
      'Terminal durumlara (DELIVERED, CANCELLED) yapılan geçişler geri alınamaz. İptal durumunda stok otomatik iade edilir.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sipariş durumu başarıyla güncellendi.',
    type: OrderDetailResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz durum geçişi veya terminal durum kural ihlali.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim — Bearer token eksik veya geçersiz.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Yetkisiz erişim — Admin rolü gereklidir.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Sipariş bulunamadı.',
    type: ErrorResponseDto,
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderDetailResponse> {
    return this.ordersService.updateOrderStatus(id, dto);
  }
}
