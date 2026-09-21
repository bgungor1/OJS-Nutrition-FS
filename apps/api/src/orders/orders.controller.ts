import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser, AuthenticatedUser } from '../common';
import { ErrorResponseDto } from '../common/dto';
import { ORDER_CHECKOUT_RATE_LIMIT } from './order.constants';
import { OrdersService } from './orders.service';
import {
  CalculateShipmentFeeQueryDto,
  CompleteShoppingDto,
  OrderQueryDto,
  OrderDetailResponseDto,
  PaginatedOrdersResponseDto,
  PaymentSettingsResponseDto,
  ShipmentFeeResponseDto,
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
    type: PaymentSettingsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim — Bearer token eksik veya geçersiz.',
    type: ErrorResponseDto,
  })
  getPaymentSettings(): PaymentSettingsResponse {
    return this.ordersService.getPaymentSettings();
  }

  @Get('calculate-shipment-fee')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Teslimat adresine ve sepet tutarına göre kargo ücretini hesaplar',
    description:
      'Kullanıcının aktif sepetindeki ürün toplamına ve seçilen adrese göre kargo ücreti döner.',
  })
  @ApiResponse({
    status: 200,
    description: 'Hesaplanan kargo ücreti ve eşik bilgisi.',
    type: ShipmentFeeResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim — Bearer token eksik veya geçersiz.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Teslimat adresi bulunamadı.',
    type: ErrorResponseDto,
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
    summary: 'Giriş yapmış kullanıcının sipariş geçmişini sayıfalı listeler',
    description:
      'Opsiyonel durum filtresi (status) ve sayfalama parametreleri (limit, offset) desteklenir.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sipariş listesi ve toplam sayı başarıyla getirildi.',
    type: PaginatedOrdersResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim — Bearer token eksik veya geçersiz.',
    type: ErrorResponseDto,
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
    description:
      'Yalnızca token sahibi kullanıcının kendi siparişleri erişilebilir; başka kullanıcı siparişleri 404 olarak döner.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sipariş detayları başarıyla getirildi.',
    type: OrderDetailResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim — Bearer token eksik veya geçersiz.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Sipariş bulunamadı veya kullanıcıya ait değil.',
    type: ErrorResponseDto,
  })
  async getOrderDetail(
    @CurrentUser() user: AuthenticatedUser,
    @Param('orderId') orderId: string,
  ): Promise<OrderDetailResponse> {
    return this.ordersService.findUserOrderById(user.id, orderId);
  }

  @Post('complete-shopping')
  @Throttle({
    default: {
      limit: ORDER_CHECKOUT_RATE_LIMIT.LIMIT,
      ttl: ORDER_CHECKOUT_RATE_LIMIT.TTL,
    },
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Sepetteki ürünleri satın alır ve siparişi tamamlar',
    description:
      'Stok rezervasyonu, ödeme işlemi ve sipariş oluşturma tek bir atomik transaction içinde gerçekleşir.',
  })
  @ApiResponse({
    status: 201,
    description: 'Sipariş başarıyla oluşturuldu.',
    type: OrderDetailResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Sepet boş veya ödeme banka tarafından onaylanmadı.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim — Bearer token eksik veya geçersiz.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Teslimat adresi veya kullanıcı bulunamadı.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Yetersiz stok — sepet kalemlerinden birinin stoğu tükendi.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Hız sınırı aşıldı (Dakikada en fazla 5 satın alma denemesi).',
    type: ErrorResponseDto,
  })
  async completeShopping(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CompleteShoppingDto,
    @Ip() ip?: string,
  ): Promise<OrderDetailResponse> {
    return this.ordersService.completeShopping(user.id, dto, ip);
  }
}
