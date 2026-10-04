import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/nestjs';

export interface SentryApiContext {
  correlationId?: string;
  method?: string;
  url?: string;
  userId?: string;
  extra?: Record<string, unknown>;
  tags?: Record<string, string>;
}

export interface SentryBreadcrumb {
  category: string;
  message: string;
  data?: Record<string, unknown>;
  level?: 'info' | 'warn' | 'error';
  timestamp?: number;
}

export interface SentrySpan {
  id?: string;
  op: string;
  description?: string;
  durationMs: number;
  status?: string;
  data?: Record<string, unknown>;
  tags?: Record<string, string>;
  timestamp?: number;
}

export interface SlowQueryMetric {
  query: string;
  duration: number;
  params?: unknown;
  target?: string;
}

export interface SlowRequestMetric {
  method: string;
  url: string;
  duration: number;
  statusCode: number;
  correlationId?: string;
}

export interface PerformanceMetricsSummary {
  totalSpans: number;
  totalRequests: number;
  slowRequests: number;
  slowQueries: number;
  averageDurationMs: number;
  p95DurationMs: number;
  p99DurationMs: number;
}

@Injectable()
export class SentryService {
  private readonly logger = new Logger(SentryService.name);
  private readonly dsn: string | undefined;

  private readonly breadcrumbs: SentryBreadcrumb[] = [];
  private readonly spans: SentrySpan[] = [];
  private readonly slowRequests: SlowRequestMetric[] = [];
  private readonly slowQueries: SlowQueryMetric[] = [];

  private static readonly MAX_BREADCRUMBS = 50;
  private static readonly MAX_SPANS = 200;

  constructor(private readonly configService?: ConfigService) {
    this.dsn =
      this.configService?.get<string>('SENTRY_DSN') || process.env.SENTRY_DSN;

    if (this.dsn) {
      try {
        Sentry.init({
          dsn: this.dsn,
          tracesSampleRate: 1.0,
          environment: process.env.NODE_ENV || 'development',
        });
      } catch {
        // Failsafe for test/mock DSNs
      }
    }
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
      'secret',
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

  addBreadcrumb(breadcrumb: SentryBreadcrumb): void {
    this.breadcrumbs.push({
      ...breadcrumb,
      timestamp: breadcrumb.timestamp || Date.now(),
    });

    if (this.breadcrumbs.length > SentryService.MAX_BREADCRUMBS) {
      this.breadcrumbs.shift();
    }

    if (this.isConfigured()) {
      try {
        const sentryLevel =
          breadcrumb.level === 'warn' ? 'warning' : breadcrumb.level || 'info';
        Sentry.addBreadcrumb({
          category: breadcrumb.category,
          message: breadcrumb.message,
          data: breadcrumb.data,
          level: sentryLevel,
        });
      } catch {
        // Failsafe
      }
    }
  }

  getBreadcrumbs(): readonly SentryBreadcrumb[] {
    return this.breadcrumbs;
  }

  clearBreadcrumbs(): void {
    this.breadcrumbs.length = 0;
  }

  recordSpan(span: SentrySpan): void {
    const completedSpan: SentrySpan = {
      ...span,
      id:
        span.id ||
        `span_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: span.timestamp || Date.now(),
    };

    this.spans.push(completedSpan);
    if (this.spans.length > SentryService.MAX_SPANS) {
      this.spans.shift();
    }

    if (this.isConfigured()) {
      this.logger.verbose(
        `[Sentry:Production:APM] Span ${completedSpan.op} (${completedSpan.durationMs}ms): ${completedSpan.description || '-'}`,
      );
    } else {
      this.logger.debug(
        `[Sentry:Local:APM] Span ${completedSpan.op} (${completedSpan.durationMs}ms): ${completedSpan.description || '-'}`,
      );
    }
  }

  getRecentSpans(): readonly SentrySpan[] {
    return this.spans;
  }

  recordSlowRequest(metric: SlowRequestMetric): void {
    this.slowRequests.push(metric);
    this.addBreadcrumb({
      category: 'performance',
      level: 'warn',
      message: `Slow API Request: ${metric.method} ${metric.url} took ${metric.duration}ms [${metric.statusCode}]`,
      data: { ...metric },
    });
  }

  getSlowRequests(): readonly SlowRequestMetric[] {
    return this.slowRequests;
  }

  recordSlowQuery(metric: SlowQueryMetric): void {
    this.slowQueries.push(metric);
    this.addBreadcrumb({
      category: 'db.slow_query',
      level: 'warn',
      message: `Slow DB Query: ${metric.query.substring(0, 100)} took ${metric.duration}ms`,
      data: {
        duration: metric.duration,
        target: metric.target,
      },
    });
  }

  getSlowQueries(): readonly SlowQueryMetric[] {
    return this.slowQueries;
  }

  getMetricsSummary(): PerformanceMetricsSummary {
    const httpSpans = this.spans.filter((s) => s.op === 'http.server');
    const durations = httpSpans.map((s) => s.durationMs).sort((a, b) => a - b);

    const calculatePercentile = (percentile: number): number => {
      if (durations.length === 0) return 0;
      const index = Math.ceil((percentile / 100) * durations.length) - 1;
      return durations[Math.max(0, index)] ?? 0;
    };

    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const averageDurationMs =
      durations.length > 0 ? Math.round(totalDuration / durations.length) : 0;

    return {
      totalSpans: this.spans.length,
      totalRequests: httpSpans.length,
      slowRequests: this.slowRequests.length,
      slowQueries: this.slowQueries.length,
      averageDurationMs,
      p95DurationMs: calculatePercentile(95),
      p99DurationMs: calculatePercentile(99),
    };
  }

  captureException(exception: unknown, context?: SentryApiContext): string {
    const localEventId = `api_err_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const message =
      exception instanceof Error ? exception.message : String(exception);
    const stack = exception instanceof Error ? exception.stack : undefined;

    const sanitizedExtra = context?.extra
      ? this.sanitize(context.extra)
      : undefined;

    const payload = {
      eventId: localEventId,
      message,
      stack,
      correlationId: context?.correlationId,
      method: context?.method,
      url: context?.url,
      userId: context?.userId,
      tags: context?.tags,
      extra: sanitizedExtra,
      breadcrumbs: [...this.breadcrumbs],
      recentSpans: this.spans.slice(-10),
      timestamp: new Date().toISOString(),
    };

    if (this.isConfigured()) {
      let sentryEventId: string | undefined;
      try {
        sentryEventId = Sentry.captureException(exception, {
          extra: sanitizedExtra,
          tags: {
            ...context?.tags,
            ...(context?.correlationId
              ? { correlationId: context.correlationId }
              : {}),
            ...(context?.method ? { method: context.method } : {}),
            ...(context?.url ? { url: context.url } : {}),
          },
          user: context?.userId ? { id: context.userId } : undefined,
        });
      } catch {
        // Failsafe
      }

      const finalId = sentryEventId || localEventId;
      this.logger.warn(
        `[Sentry:Production] Event ${finalId} dispatched: ${message}`,
        payload,
      );
      return finalId;
    } else {
      this.logger.debug(
        `[Sentry:Local] Event ${localEventId} logged: ${message}`,
        payload,
      );
      return localEventId;
    }
  }
}
