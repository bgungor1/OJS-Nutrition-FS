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
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminService } from './admin.service';
import {
  AdminUserDetailResponseDto,
  AdminUserListItemDto,
  AdminUsersPaginatedResponseDto,
  AdminUsersQueryDto,
  DashboardStatsResponseDto,
  UpdateUserRoleDto,
} from './dto';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.admin)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly dashboardService: AdminDashboardService,
  ) {}

  @Get('dashboard/stats')
  @ApiOperation({
    summary: 'Dashboard analitik ve istatistiklerini getir',
    description:
      'Admin paneli için özet metrikleri, ciro, statü dağılımı, son siparişler, en çok satanlar, kritik stok uyarıları ve 30 günlük satış trendini döner.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard istatistikleri başarıyla getirildi.',
    type: DashboardStatsResponseDto,
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
  async getDashboardStats(): Promise<DashboardStatsResponseDto> {
    return this.dashboardService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({
    summary: 'Kullanıcıları listele',
    description:
      'Admin paneli için sayfalanmış, filtrelenmiş ve aranabilir kullanıcı listesini döner.',
  })
  @ApiResponse({
    status: 200,
    description: 'Kullanıcı listesi başarıyla getirildi.',
    type: AdminUsersPaginatedResponseDto,
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
  async listUsers(
    @Query() query: AdminUsersQueryDto,
  ): Promise<AdminUsersPaginatedResponseDto> {
    return this.adminService.listUsers(query);
  }

  @Get('users/:id')
  @ApiOperation({
    summary: 'Kullanıcı detayı getir',
    description:
      'Belirtilen kullanıcının detay profilini, kayıtlı adreslerini ve geçmiş sipariş özetini döner.',
  })
  @ApiParam({
    name: 'id',
    description: 'Kullanıcı UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Kullanıcı detayı başarıyla getirildi.',
    type: AdminUserDetailResponseDto,
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
    description: 'Kullanıcı bulunamadı.',
    type: ErrorResponseDto,
  })
  async getUserById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AdminUserDetailResponseDto> {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id/role')
  @ApiOperation({
    summary: 'Kullanıcı rolünü güncelle',
    description:
      'Kullanıcıya yeni bir sistem rolü (customer/admin) atar. Kendi yetkisini kaldırma (self-lockout) ve sistemdeki son admini düşürme (last-admin) korumalıdır.',
  })
  @ApiParam({
    name: 'id',
    description: 'Kullanıcı UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Kullanıcı rolü başarıyla güncellendi.',
    type: AdminUserListItemDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Geçersiz işlem (kendi adminliğini kaldırma veya son admini silme girişimi).',
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
    description: 'Kullanıcı bulunamadı.',
    type: ErrorResponseDto,
  })
  async updateUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() user: AuthenticatedUser,
    @Ip() ip: string,
  ): Promise<AdminUserListItemDto> {
    return this.adminService.updateUserRole(user.id, id, dto, ip);
  }
}
