import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

/**
 * BACKEND_PLAN §5.1 — hepsi @Public():
 *  POST /auth/login            { username, password }        -> { access, refresh }
 *  POST /auth/register         RegisterDto                   -> { user, message }
 *  POST /auth/token/refresh    { refresh }                   -> { access }
 *  GET  /auth/google           -> Google consent redirect
 *  GET  /auth/google/callback  -> access/refresh cookie + redirect
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
}
