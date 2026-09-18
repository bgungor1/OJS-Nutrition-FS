import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuditEvent, SecurityAuditService } from '../common/audit';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import {
  RegisterResponse,
  TokensResponse,
} from './interfaces/auth-response.interface';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private static readonly BCRYPT_SALT_ROUNDS = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    @Optional() private readonly auditService?: SecurityAuditService,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResponse> {
    if (dto.password !== dto.password2) {
      throw new BadRequestException('Şifreler eşleşmiyor.');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Bu e-posta adresi zaten kullanımda.');
    }

    const passwordHash = await bcrypt.hash(
      dto.password,
      AuthService.BCRYPT_SALT_ROUNDS,
    );

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.first_name,
        lastName: dto.last_name,
        authProvider: 'local',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    this.logger.log(
      `Yeni kullanıcı başarıyla kaydedildi: ${user.email} (${user.id})`,
    );

    this.auditService?.info(AuditEvent.AUTH_REGISTER, {
      userId: user.id,
      details: { email: user.email },
    });

    return {
      user,
      message: 'Kayıt başarıyla tamamlandı.',
    };
  }

  async login(dto: LoginDto, ipAddress?: string): Promise<TokensResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.username },
    });

    if (!user || user.authProvider !== 'local' || !user.passwordHash) {
      this.logger.warn(
        `Başarısız oturum açma denemesi (Kullanıcı bulunamadı/geçersiz sağlayıcı): ${dto.username} - IP: ${ipAddress ?? 'bilinmiyor'}`,
      );
      this.auditService?.warn(AuditEvent.AUTH_LOGIN_FAILED, {
        ip: ipAddress,
        details: {
          email: dto.username,
          reason: 'USER_NOT_FOUND_OR_INVALID_PROVIDER',
        },
      });
      throw new UnauthorizedException('Geçersiz e-posta veya şifre.');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      this.logger.warn(
        `Başarısız oturum açma denemesi (Hatalı şifre): ${dto.username} - IP: ${ipAddress ?? 'bilinmiyor'}`,
      );
      this.auditService?.warn(AuditEvent.AUTH_LOGIN_FAILED, {
        ip: ipAddress,
        userId: user.id,
        details: { email: dto.username, reason: 'INVALID_PASSWORD' },
      });
      throw new UnauthorizedException('Geçersiz e-posta veya şifre.');
    }

    const tokens = await this.tokenService.generateTokens(
      user.id,
      user.email,
      user.role,
    );

    this.logger.log(
      `Kullanıcı oturum açtı: ${user.email} (${user.id}) - IP: ${ipAddress ?? 'bilinmiyor'}`,
    );

    this.auditService?.info(AuditEvent.AUTH_LOGIN_SUCCESS, {
      ip: ipAddress,
      userId: user.id,
      details: { email: user.email },
    });

    return tokens;
  }

  async refreshToken(
    dto: RefreshTokenDto,
    ipAddress?: string,
  ): Promise<TokensResponse> {
    return this.tokenService.rotateRefreshToken(dto.refresh, ipAddress);
  }

  async logout(
    dto: LogoutDto,
    ipAddress?: string,
  ): Promise<{ message: string }> {
    await this.tokenService.revokeRefreshToken(dto.refreshToken, ipAddress);
    return { message: 'Oturum başarıyla sonlandırıldı.' };
  }

  async revokeAllSessions(
    userId: string,
    ipAddress?: string,
  ): Promise<{ message: string }> {
    await this.tokenService.revokeAllUserTokens(
      userId,
      ipAddress,
      'USER_REVOKE_ALL',
    );
    return { message: 'Tüm aktif oturumlar başarıyla sonlandırıldı.' };
  }
}
