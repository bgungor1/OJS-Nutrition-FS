import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';

/**
 * BACKEND_PLAN §5.6 — Bearer:
 *  GET  /orders                                  -> Order[]
 *  GET  /orders/:orderId                         -> Order (cart_detail + address)
 *  GET  /orders/payment-settings                 -> { card_types, payment_types }
 *  GET  /orders/calculate-shipment-fee?address_id -> { fee, currency }
 *  POST /orders/complete-shopping   CompleteShoppingDto -> Order
 *      { address_id, payment_type: 'credit_card'|'debit_card', payment_token }
 *
 * Admin: PUT /orders/:id/status  @Roles('admin')  (stok geri-ekleme — §5.6.1)
 */
@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
}
