import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Sepet uçlarında kullanılır (BACKEND_PLAN §5.5): token varsa doğrulanıp
 * req.user set edilir, yoksa istek misafir olarak geçer (reddedilmez).
 */
@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(_err: unknown, user: TUser | false): TUser | undefined {
    return user || undefined;
  }
}
