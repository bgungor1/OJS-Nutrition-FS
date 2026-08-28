import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { AuthenticatedUser } from '../types/authenticated-user';

/**
 * Controller imzasında `@CurrentUser() user: AuthenticatedUser` olarak kullanılır.
 * OptionalAuthGuard'lı route'larda undefined dönebilir.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as AuthenticatedUser | undefined;
  },
);
