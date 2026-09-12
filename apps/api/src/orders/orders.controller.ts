import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, Roles, AuthenticatedUser } from '../common';
import { OrdersService } from './orders.service';
import {
  CompleteShoppingDto,
  OrderQueryDto,
  CalculateShipmentFeeQueryDto,
  UpdateOrderStatusDto,
} from './dto';
import {
  OrderDetailResponse,
  PaginatedOrdersResponse,
  ShipmentFeeResponse,
} from './interfaces';
import { PaymentSettingsResponse } from '../payments';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('payment-settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ödeme ayarlarını ve desteklenen kart tiplerini getirir',
  })
  @ApiResponse({
    status: 200,
    description: 'Ödeme seçenekleri ve kart tipleri başarıyla getirildi.',
  })
  getPaymentSettings(): PaymentSettingsResponse {
    return this.ordersService.getPaymentSettings();
  }

  @Get('calculate-shipment-fee')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Teslimat adresine ve sepet tutarına göre kargo ücretini hesaplar',
  })
  @ApiResponse({
    status: 200,
    description: 'Hesaplanan kargo ücreti ve eşik bilgisi.',
  })
  @ApiResponse({
    status: 404,
    description: 'Teslimat adresi bulunamadı.',
  })
  async calculateShipmentFee(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: CalculateShipmentFeeQueryDto,
  ): Promise<ShipmentFeeResponse> {
    return this.ordersService.calculateShipmentFee(user.id, query.address_id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Giriş yapmış kullanıcının sipariş geçmişini sayfalı listeler',
  })
  @ApiResponse({
    status: 200,
    description: 'Sipariş listesi ve toplam sayı başarıyla getirildi.',
  })
  async listOrders(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: OrderQueryDto,
  ): Promise<PaginatedOrdersResponse> {
    return this.ordersService.findUserOrders(user.id, query);
  }

  @Get(':orderId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Kullanıcının tekil sipariş detayını getirir (IDOR korumalı)',
  })
  @ApiResponse({
    status: 200,
    description: 'Sipariş detayları başarıyla getirildi.',
  })
  @ApiResponse({
    status: 404,
    description: 'Sipariş bulunamadı veya kullanıcıya ait değil.',
  })
  async getOrderDetail(
    @CurrentUser() user: AuthenticatedUser,
    @Param('orderId') orderId: string,
  ): Promise<OrderDetailResponse> {
    return this.ordersService.findUserOrderById(user.id, orderId);
  }

  @Post('complete-shopping')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Sepetteki ürünleri satın alır ve siparişi tamamlar',
  })
  @ApiResponse({
    status: 201,
    description: 'Sipariş başarıyla oluşturuldu.',
  })
  @ApiResponse({
    status: 400,
    description: 'Sepet boş veya ödeme banka tarafından onaylanmadı.',
  })
  @ApiResponse({
    status: 404,
    description: 'Teslimat adresi veya kullanıcı bulunamadı.',
  })
  @ApiResponse({
    status: 409,
    description: 'Yetersiz stok — sepet kalemlerinden birinin stoğu tükendi.',
  })
  async completeShopping(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CompleteShoppingDto,
    @Ip() ip?: string,
  ): Promise<OrderDetailResponse> {
    return this.ordersService.completeShopping(user.id, dto, ip);
  }

  @Put(':id/status')
  @Roles(Role.admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Sipariş durumunu günceller ve gerekirse stok iadesi yapar (Admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'Sipariş durumu başarıyla güncellendi.',
  })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz durum geçişi veya terminal durum kural ihlali.',
  })
  @ApiResponse({
    status: 403,
    description: 'Yetkisiz erişim — Admin rolü gereklidir.',
  })
  @ApiResponse({
    status: 404,
    description: 'Sipariş bulunamadı.',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderDetailResponse> {
    return this.ordersService.updateOrderStatus(id, dto);
  }
}
