import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
  Optional,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { CORRELATION_ID_HEADER } from '../constants';
import { SentryService } from '../observability/sentry.service';

export const SLOW_API_THRESHOLD_MS = 200;

/**
 * NestJS Performance Interceptor:
 * 1. Her API isteğinin süresini milisaniye hassasiyetinde ölçer.
 * 2. İstemciye `X-Response-Time: <ms>ms` başlığını döner.
 * 3. Süresi >= 200ms olan yavaş API çağrılarını `Logger.warn` ile loglar.
 * 4. Sentry APM servisine distributed tracing span ve breadcrumb'larını iletir.
 * Bkz. Faz 2.1 — Radar: Sentry APM & Metrics.
 */
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);

  constructor(@Optional() private readonly sentryService?: SentryService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest<Request>();
    const res = httpContext.getResponse<Response>();

    const startTime = Date.now();
    const method = req?.method ?? 'UNKNOWN';
    const url = req?.originalUrl || req?.url || 'UNKNOWN';
    const correlationId =
      (req as Request & { correlationId?: string })?.correlationId ??
      (req?.headers?.[CORRELATION_ID_HEADER.toLowerCase()] as
        string | undefined);

    let recorded = false;

    const measureAndRecord = (): void => {
      if (recorded) return;
      recorded = true;

      const duration = Date.now() - startTime;
      const statusCode = res?.statusCode ?? 200;

      if (res && typeof res.setHeader === 'function' && !res.headersSent) {
        res.setHeader('X-Response-Time', `${duration}ms`);
      }

      this.sentryService?.recordSpan({
        op: 'http.server',
        description: `${method} ${url}`,
        durationMs: duration,
        status:
          statusCode >= 500
            ? 'internal_error'
            : statusCode >= 400
              ? 'error'
              : 'ok',
        data: {
          method,
          url,
          statusCode,
          correlationId,
        },
      });

      this.sentryService?.addBreadcrumb({
        category: 'http',
        message: `${method} ${url} completed in ${duration}ms [${statusCode}]`,
        data: { duration, statusCode, correlationId },
      });

      if (duration >= SLOW_API_THRESHOLD_MS) {
        this.logger.warn(
          `[Slow API Request >= ${SLOW_API_THRESHOLD_MS}ms] ${method} ${url} ${statusCode} in ${duration}ms${
            correlationId ? ` (Correlation ID: ${correlationId})` : ''
          }`,
        );

        this.sentryService?.recordSlowRequest({
          method,
          url,
          duration,
          statusCode,
          correlationId,
        });
      }
    };

    return next.handle().pipe(
      tap({
        next: () => {
          measureAndRecord();
        },
      }),
      finalize(() => {
        measureAndRecord();
      }),
    );
  }
}
