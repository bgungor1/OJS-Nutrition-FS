import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppConfig } from '../config/configuration';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleAuthService } from './google-auth.service';
import { TokenService } from './token.service';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => ({
        secret: config.get('jwt', { infer: true }).accessSecret,
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleAuthService,
    TokenService,
    JwtStrategy,
    GoogleStrategy,
    GoogleOAuthGuard,
  ],
  exports: [AuthService, GoogleAuthService, TokenService, JwtModule],
})
export class AuthModule {}
