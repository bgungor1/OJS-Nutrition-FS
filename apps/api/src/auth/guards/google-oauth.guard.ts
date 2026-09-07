import {
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { AppConfig } from '../../config/configuration';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  constructor(private readonly config: ConfigService<AppConfig, true>) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const googleConfig = this.config.get('google', { infer: true });

    if (!googleConfig.clientId || !googleConfig.clientSecret) {
      throw new ServiceUnavailableException(
        'Google OAuth servisi henüz yapılandırılmamış. Lütfen GOOGLE_CLIENT_ID ve GOOGLE_CLIENT_SECRET ortam değişkenlerini tanımlayınız.',
      );
    }

    return super.canActivate(context);
  }
}
