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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { AdminService } from './admin.service';
import {
  AdminUserDetailResponseDto,
  AdminUserListItemDto,
  AdminUsersPaginatedResponseDto,
  AdminUsersQueryDto,
  UpdateUserRoleDto,
} from './dto';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.admin)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
  })
  @ApiResponse({
    status: 403,
    description: 'Erişim engellendi (admin rolü gereklidir).',
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
  @ApiResponse({
    status: 200,
    description: 'Kullanıcı detayı başarıyla getirildi.',
    type: AdminUserDetailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Kullanıcı bulunamadı.',
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
  @ApiResponse({
    status: 200,
    description: 'Kullanıcı rolü başarıyla güncellendi.',
    type: AdminUserListItemDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Geçersiz işlem (kendi adminliğini kaldırma veya son admini silme girişimi).',
  })
  @ApiResponse({
    status: 404,
    description: 'Kullanıcı bulunamadı.',
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
