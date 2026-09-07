import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AppConfig } from '../../config/configuration';
import { GoogleProfile } from '../interfaces/auth-response.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService<AppConfig, true>) {
    const googleConfig = config.get('google', { infer: true });

    super({
      clientID: googleConfig.clientId || 'dummy-google-client-id',
      clientSecret: googleConfig.clientSecret || 'dummy-google-client-secret',
      callbackURL:
        googleConfig.callbackUrl ||
        'http://localhost:3000/api/v1/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      return done(
        new Error('Google hesabından e-posta adresi alınamadı.'),
        false,
      );
    }

    const googleProfile: GoogleProfile = {
      googleId: profile.id,
      email,
      firstName: profile.name?.givenName,
      lastName: profile.name?.familyName,
    };

    done(null, googleProfile);
  }
}
