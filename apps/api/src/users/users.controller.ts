import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  AccountProfile,
  AccountProfileDto,
} from './interfaces/account-profile.interface';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('my-account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mevcut kullanıcının profil bilgilerini getirir' })
  @ApiResponse({
    status: 200,
    description: 'Kullanıcı profil bilgileri başarıyla getirildi.',
    type: AccountProfileDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim — Bearer token eksik veya geçersiz.',
  })
  @ApiResponse({
    status: 404,
    description: 'Kullanıcı hesabı bulunamadı.',
  })
  async getMyAccount(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AccountProfile> {
    return this.usersService.getMyAccount(user.id);
  }

  @Put('my-account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mevcut kullanıcının profil bilgilerini günceller' })
  @ApiResponse({
    status: 200,
    description: 'Kullanıcı profil bilgileri başarıyla güncellendi.',
    type: AccountProfileDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Geçersiz veri formatı veya alan kısıtı ihlali.',
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim — Bearer token eksik veya geçersiz.',
  })
  @ApiResponse({
    status: 404,
    description: 'Kullanıcı hesabı bulunamadı.',
  })
  async updateMyAccount(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<AccountProfile> {
    return this.usersService.updateMyAccount(user.id, dto);
  }
}
