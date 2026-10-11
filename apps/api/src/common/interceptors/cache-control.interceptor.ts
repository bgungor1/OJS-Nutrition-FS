import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { Observable } from 'rxjs';
import {
  CACHE_CONTROL_METADATA_KEY,
  CacheControlOptions,
} from '../decorators/cache-control.decorator';

@Injectable()
export class CacheControlInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const options = this.reflector.getAllAndOverride<
      CacheControlOptions | undefined
    >(CACHE_CONTROL_METADATA_KEY, [context.getHandler(), context.getClass()]);

    if (options && context.getType() === 'http') {
      const http = context.switchToHttp();
      const response = http.getResponse<Response>();

      if (response && typeof response.setHeader === 'function') {
        const directives: string[] = [options.scope ?? 'public'];
        directives.push(`max-age=${options.maxAge}`);

        if (options.sMaxAge !== undefined) {
          directives.push(`s-maxage=${options.sMaxAge}`);
        }
        if (options.staleWhileRevalidate !== undefined) {
          directives.push(
            `stale-while-revalidate=${options.staleWhileRevalidate}`,
          );
        }
        if (options.mustRevalidate) {
          directives.push('must-revalidate');
        }

        response.setHeader('Cache-Control', directives.join(', '));
      }
    }

    return next.handle();
  }
}
