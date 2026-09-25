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
import { CurrentUser, AuthenticatedUser } from '../common';
import { ErrorResponseDto } from '../common/dto';
import { UpdateProfileDto } from './dto';
import { AccountProfile, AccountProfileDto } from './interfaces';
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
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Kullanıcı hesabı bulunamadı.',
    type: ErrorResponseDto,
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
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Yetkisiz erişim — Bearer token eksik veya geçersiz.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Kullanıcı hesabı bulunamadı.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'E-posta adresi zaten kullanımda.',
    type: ErrorResponseDto,
  })
  async updateMyAccount(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<AccountProfile> {
    return this.usersService.updateMyAccount(user.id, dto);
  }
}
