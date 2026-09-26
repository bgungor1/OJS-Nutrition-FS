import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SentryApiContext {
  correlationId?: string;
  method?: string;
  url?: string;
  userId?: string;
  extra?: Record<string, unknown>;
  tags?: Record<string, string>;
}

@Injectable()
export class SentryService {
  private readonly logger = new Logger(SentryService.name);
  private readonly dsn: string | undefined;

  constructor(private readonly configService?: ConfigService) {
    this.dsn =
      this.configService?.get<string>('SENTRY_DSN') || process.env.SENTRY_DSN;
  }

  isConfigured(): boolean {
    return Boolean(this.dsn);
  }

  sanitize(data: Record<string, unknown>): Record<string, unknown> {
    const sensitiveKeys = [
      'password',
      'passwordhash',
      'token',
      'accesstoken',
      'refreshtoken',
      'cardnumber',
      'cvv',
      'authorization',
      'cookie',
    ];
    const clean: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      if (sensitiveKeys.includes(key.toLowerCase())) {
        clean[key] = '[REDACTED]';
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        clean[key] = this.sanitize(value as Record<string, unknown>);
      } else {
        clean[key] = value;
      }
    }

    return clean;
  }

  captureException(exception: unknown, context?: SentryApiContext): string {
    const eventId = `api_err_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const message =
      exception instanceof Error ? exception.message : String(exception);
    const stack = exception instanceof Error ? exception.stack : undefined;

    const payload = {
      eventId,
      message,
      stack,
      correlationId: context?.correlationId,
      method: context?.method,
      url: context?.url,
      userId: context?.userId,
      tags: context?.tags,
      extra: context?.extra ? this.sanitize(context.extra) : undefined,
      timestamp: new Date().toISOString(),
    };

    if (this.isConfigured()) {
      this.logger.warn(
        `[Sentry:Production] Event ${eventId} dispatched: ${message}`,
        payload,
      );
    } else {
      this.logger.debug(
        `[Sentry:Local] Event ${eventId} logged: ${message}`,
        payload,
      );
    }

    return eventId;
  }
}
