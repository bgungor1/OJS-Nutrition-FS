import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { GoogleAuthService } from './google-auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import {
  GoogleProfile,
  RegisterResponse,
  TokensResponse,
} from './interfaces/auth-response.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Yeni kullanıcı kaydı oluşturur' })
  @ApiResponse({
    status: 201,
    description: 'Kullanıcı başarıyla kaydedildi.',
  })
  @ApiResponse({
    status: 400,
    description: 'Doğrulama hatası veya şifreler eşleşmiyor.',
  })
  @ApiResponse({
    status: 409,
    description: 'Bu e-posta adresi zaten kullanımda.',
  })
  async register(@Body() dto: RegisterDto): Promise<RegisterResponse> {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Kullanıcı oturumu açar ve JWT access & refresh token üretir',
  })
  @ApiResponse({
    status: 200,
    description: 'Giriş başarılı, token çifti döndürüldü.',
  })
  @ApiResponse({
    status: 401,
    description: 'Geçersiz e-posta veya şifre.',
  })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ): Promise<TokensResponse> {
    return this.authService.login(dto, req.ip);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('token/refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Refresh token ile yeni access ve refresh token üretir (Token Rotation)',
  })
  @ApiResponse({
    status: 200,
    description: 'Yeni token çifti başarıyla üretildi.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Geçersiz, süresi dolmuş veya iptal edilmiş yenileme anahtarı.',
  })
  async refreshToken(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
  ): Promise<TokensResponse> {
    return this.authService.refreshToken(dto, req.ip);
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Google OAuth consent sayfasına yönlendirir' })
  async googleAuth(): Promise<void> {}

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({
    summary: 'Google OAuth callback dönüşünü işler ve token üretir',
  })
  async googleAuthCallback(
    @Req() req: Request & { user: GoogleProfile },
    @Res() res: Response,
  ): Promise<void> {
    const tokens = await this.googleAuthService.validateOrCreateGoogleUser(
      req.user,
    );
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (req.headers.accept?.includes('application/json')) {
      res.json({ status: 'success', data: tokens });
      return;
    }

    res.redirect(
      `${frontendUrl}/auth/callback?access=${tokens.access}&refresh=${tokens.refresh}`,
    );
  }
}
