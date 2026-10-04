import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { SentryService } from '../common/observability/sentry.service';

export const SLOW_QUERY_THRESHOLD_MS = 50;

/**
 * PrismaService:
 * 1. PostgreSQL bağlantı yaşam döngüsünü ($connect / $disconnect) yönetir.
 * 2. Süresi >= 50ms olan tüm veritabanı sorgularını tespit eder ve parametreleri
 *    hassas verilerden (şifre, token, hash vb.) arındırarak loglar (Prisma Slow Query Logging).
 * 3. Sentry APM servisine distributed tracing span ve yavaş sorgu breadcrumb'larını iletir.
 * Bkz. Faz 2.1 — Radar: Prisma Slow Query Logging.
 */
@Injectable()
export class PrismaService
  extends PrismaClient<
    Prisma.PrismaClientOptions,
    'query' | 'error' | 'info' | 'warn'
  >
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(@Optional() private readonly sentryService?: SentryService) {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'warn' },
      ],
    });
  }

  async onModuleInit(): Promise<void> {
    this.registerQueryLogging();
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  private registerQueryLogging(): void {
    if (typeof this.$on === 'function') {
      this.$on('query', (event: Prisma.QueryEvent) => {
        this.handleQueryEvent(event);
      });
    }
  }

  handleQueryEvent(event: Prisma.QueryEvent): void {
    const sanitizedParams = this.sanitizeParams(event.params);

    this.sentryService?.recordSpan({
      op: 'db.query',
      description: event.query,
      durationMs: event.duration,
      data: {
        target: event.target,
        params: sanitizedParams,
      },
    });

    if (event.duration >= SLOW_QUERY_THRESHOLD_MS) {
      this.logger.warn(
        `[Slow DB Query >= ${SLOW_QUERY_THRESHOLD_MS}ms] ${event.duration}ms: ${event.query} -- params: ${sanitizedParams}`,
      );

      this.sentryService?.recordSlowQuery({
        query: event.query,
        duration: event.duration,
        params: sanitizedParams,
        target: event.target,
      });

      this.sentryService?.addBreadcrumb({
        category: 'db.slow_query',
        level: 'warn',
        message: `Slow Query (${event.duration}ms): ${event.query.substring(0, 100)}`,
        data: {
          duration: event.duration,
          target: event.target,
        },
      });
    }
  }

  sanitizeParams(params: unknown): string {
    if (!params) return '[]';
    const paramsStr =
      typeof params === 'string' ? params : JSON.stringify(params);

    return paramsStr
      .replace(
        /(["']?(?:password|passwordHash|token|accessToken|refreshToken|cardNumber|cvv|secret)["']?\s*[:=]\s*["']?)[^"',}\]]+(["']?)/gi,
        '$1[REDACTED]$2',
      )
      .replace(/\$2[aby]\$\d+\$[./0-9A-Za-z]{53}/g, '[REDACTED_BCRYPT_HASH]');
  }
}
