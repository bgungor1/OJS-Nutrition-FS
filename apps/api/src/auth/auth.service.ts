import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'node:crypto';
import { AppConfig } from '../config/configuration';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  RegisterResponse,
  TokensResponse,
} from './interfaces/auth-response.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private static readonly BCRYPT_SALT_ROUNDS = 10;
  private static readonly REFRESH_TOKEN_DAYS = 7;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<TokensResponse> {
    const jwtConfig = this.config.get('jwt', { infer: true });

    const [access, refresh] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: jwtConfig.accessSecret,
          expiresIn: jwtConfig.accessExpires as unknown as number,
        },
      ),
      this.jwtService.signAsync(
        { sub: userId },
        {
          secret: jwtConfig.refreshSecret,
          expiresIn: jwtConfig.refreshExpires as unknown as number,
        },
      ),
    ]);

    const expiresAt = new Date(
      Date.now() + AuthService.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
    );
    const tokenHash = this.hashToken(refresh);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return { access, refresh };
  }

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
      throw new UnauthorizedException('Geçersiz e-posta veya şifre.');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    this.logger.log(
      `Kullanıcı oturum açtı: ${user.email} (${user.id}) - IP: ${ipAddress ?? 'bilinmiyor'}`,
    );

    return tokens;
  }
}
