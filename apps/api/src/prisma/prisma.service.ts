import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';
import { SentryService } from '../common/observability/sentry.service';
import { AppConfig, DatabaseConfig } from '../config/configuration';

export const SLOW_QUERY_THRESHOLD_MS = 50;

export interface SafeConnectionSummary {
  host: string;
  port: number | string;
  database: string;
  connectionLimit: string;
  poolTimeout: string;
  pgbouncer: boolean;
}

/**
 * Prisma Client wrapper'ı:
 * - Veritabanı bağlantı yaşam döngüsünü ($connect / $disconnect) yönetir.
 * - Bağlantı havuzu ve PgBouncer parametrelerini yapılandırır.
 * - Yavaş sorguları (> 50ms) tespit eder ve Sentry APM'e iletir.
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
  readonly configuredDatasourceUrl?: string;

  constructor(
    @Optional() private readonly sentryService?: SentryService,
    @Optional() private readonly configService?: ConfigService<AppConfig>,
  ) {
    const datasourceUrl = PrismaService.resolveDatasourceUrl(configService);
    super({
      datasources: datasourceUrl ? { db: { url: datasourceUrl } } : undefined,
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'warn' },
      ],
    });
    this.configuredDatasourceUrl = datasourceUrl;
  }

  static resolveDatasourceUrl(
    configService?: ConfigService<AppConfig>,
    explicitUrl?: string,
  ): string | undefined {
    const dbConfig = configService?.get<DatabaseConfig>('database');
    const rawUrl =
      explicitUrl !== undefined
        ? explicitUrl
        : dbConfig?.url ||
          configService?.get<string>('databaseUrl') ||
          process.env.DATABASE_URL;

    if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
      return undefined;
    }

    try {
      const url = new URL(rawUrl.trim());
      const isPostgres =
        url.protocol === 'postgresql:' || url.protocol === 'postgres:';

      if (!isPostgres) {
        return rawUrl;
      }

      const connectionLimit =
        dbConfig?.connectionLimit ??
        (process.env.DATABASE_CONNECTION_LIMIT
          ? parseInt(process.env.DATABASE_CONNECTION_LIMIT, 10)
          : undefined);

      const poolTimeout =
        dbConfig?.poolTimeout ??
        (process.env.DATABASE_POOL_TIMEOUT
          ? parseInt(process.env.DATABASE_POOL_TIMEOUT, 10)
          : undefined);

      const connectTimeout =
        dbConfig?.connectTimeout ??
        (process.env.DATABASE_CONNECT_TIMEOUT
          ? parseInt(process.env.DATABASE_CONNECT_TIMEOUT, 10)
          : undefined);

      if (connectionLimit && !url.searchParams.has('connection_limit')) {
        url.searchParams.set('connection_limit', connectionLimit.toString());
      }

      if (poolTimeout && !url.searchParams.has('pool_timeout')) {
        url.searchParams.set('pool_timeout', poolTimeout.toString());
      }

      if (connectTimeout && !url.searchParams.has('connect_timeout')) {
        url.searchParams.set('connect_timeout', connectTimeout.toString());
      }

      const isPoolerPort = url.port === '6543';
      const isSupabasePoolerHost = url.hostname.includes('pooler.supabase.com');
      if (
        (isPoolerPort || isSupabasePoolerHost) &&
        !url.searchParams.has('pgbouncer')
      ) {
        url.searchParams.set('pgbouncer', 'true');
      }

      return url.toString();
    } catch {
      return rawUrl;
    }
  }

  /**
   * Veritabanı bağlantı bilgilerini şifre ve hassas kimlik bilgileri arındırılmış (sanitized)
   * güvenli bir özet olarak döner.
   */
  getSafeConnectionSummary(): SafeConnectionSummary | null {
    const activeUrl = this.configuredDatasourceUrl || process.env.DATABASE_URL;
    if (!activeUrl) return null;

    try {
      const url = new URL(activeUrl);
      return {
        host: url.hostname,
        port: url.port || (url.protocol.startsWith('postgres') ? 5432 : ''),
        database: url.pathname.replace(/^\//, ''),
        connectionLimit: url.searchParams.get('connection_limit') || 'default',
        poolTimeout: url.searchParams.get('pool_timeout') || 'default',
        pgbouncer: url.searchParams.get('pgbouncer') === 'true',
      };
    } catch {
      return null;
    }
  }

  async onModuleInit(): Promise<void> {
    this.registerQueryLogging();
    this.logPoolConfiguration();
    await this.$connect();
  }

  private logPoolConfiguration(): void {
    const summary = this.getSafeConnectionSummary();
    if (summary) {
      this.logger.log(
        `[Database Pool] Connected to ${summary.database} on ${summary.host}:${summary.port} | ` +
          `connection_limit: ${summary.connectionLimit} | pool_timeout: ${summary.poolTimeout} | ` +
          `pgbouncer: ${summary.pgbouncer}`,
      );
    }
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
