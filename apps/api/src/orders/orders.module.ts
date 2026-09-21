import { Module } from '@nestjs/common';
import { PaymentsModule } from '../payments/payments.module';
import { OrdersAdminController } from './orders-admin.controller';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [PaymentsModule],
  controllers: [OrdersController, OrdersAdminController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
