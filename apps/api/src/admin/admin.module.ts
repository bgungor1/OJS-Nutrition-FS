import { Module } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  controllers: [AdminController, AdminOrdersController],
  providers: [AdminService, AdminDashboardService, AdminOrdersService],
  exports: [AdminService, AdminDashboardService, AdminOrdersService],
})
export class AdminModule {}
