import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { AdminService } from './admin.service';

/**
 * BACKEND_PLAN §5.10 — hepsi @Roles('admin') + Bearer:
 *  GET /admin/dashboard/stats  -> { totalOrders, totalRevenue, ordersByStatus, ... }
 *  GET /admin/users?limit=&offset=  -> { count, results: User[] }
 */
@ApiTags('admin')
@ApiBearerAuth()
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
}
