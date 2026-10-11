import { Prisma } from '@prisma/client';
import { PrismaService, SLOW_QUERY_THRESHOLD_MS } from './prisma.service';
import { SentryService } from '../common/observability/sentry.service';

describe('PrismaService', () => {
  let service: PrismaService;
  let mockSentryService: {
    recordSpan: jest.Mock;
    recordSlowQuery: jest.Mock;
    addBreadcrumb: jest.Mock;
  };
  let loggerWarnSpy: jest.SpyInstance;
  let connectSpy: jest.SpyInstance;
  let disconnectSpy: jest.SpyInstance;

  beforeEach(() => {
    mockSentryService = {
      recordSpan: jest.fn(),
      recordSlowQuery: jest.fn(),
      addBreadcrumb: jest.fn(),
    };

    service = new PrismaService(mockSentryService as unknown as SentryService);

    connectSpy = jest
      .spyOn(service, '$connect')
      .mockResolvedValue(undefined as never);
    disconnectSpy = jest
      .spyOn(service, '$disconnect')
      .mockResolvedValue(undefined as never);

    loggerWarnSpy = jest
      .spyOn(
        (service as unknown as { logger: { warn: jest.Mock } }).logger,
        'warn',
      )
      .mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls $connect on onModuleInit and $disconnect on onModuleDestroy', async () => {
    await service.onModuleInit();
    expect(connectSpy).toHaveBeenCalledTimes(1);

    await service.onModuleDestroy();
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });

  describe('Slow Query Logging & APM Tracking', () => {
    it('records APM span for normal fast queries without logging warning', () => {
      const fastEvent: Prisma.QueryEvent = {
        timestamp: new Date(),
        query: 'SELECT * FROM "Product" WHERE id = $1',
        params: '["prod-123"]',
        duration: 12,
        target: 'Product',
      };

      service.handleQueryEvent(fastEvent);

      expect(mockSentryService.recordSpan).toHaveBeenCalledWith({
        op: 'db.query',
        description: 'SELECT * FROM "Product" WHERE id = $1',
        durationMs: 12,
        data: {
          target: 'Product',
          params: '["prod-123"]',
        },
      });
      expect(loggerWarnSpy).not.toHaveBeenCalled();
      expect(mockSentryService.recordSlowQuery).not.toHaveBeenCalled();
    });

    it('logs warning and notifies Sentry APM when query duration exceeds threshold', () => {
      const slowEvent: Prisma.QueryEvent = {
        timestamp: new Date(),
        query: 'SELECT * FROM "Order" WHERE "status" = $1',
        params: '["DELIVERED"]',
        duration: 75,
        target: 'Order',
      };

      service.handleQueryEvent(slowEvent);

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `[Slow DB Query >= ${SLOW_QUERY_THRESHOLD_MS}ms] 75ms: SELECT * FROM "Order" WHERE "status" = $1 -- params: ["DELIVERED"]`,
        ),
      );
      expect(mockSentryService.recordSlowQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'SELECT * FROM "Order" WHERE "status" = $1',
          duration: 75,
          target: 'Order',
        }),
      );
      expect(mockSentryService.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'db.slow_query',
          level: 'warn',
        }),
      );
    });

    it('sanitizes sensitive data and bcrypt password hashes in query params', () => {
      const sensitiveParams = JSON.stringify({
        email: 'admin@example.com',
        password: 'superSecretPassword',
        passwordHash:
          '$2b$10$eO0V4g7mR15P088Z6sO7e.eXbXo1n6T88W4VjT.1zL1i6uA.9Y/W2',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      });

      const sanitized = service.sanitizeParams(sensitiveParams);
      expect(sanitized).not.toContain('superSecretPassword');
      expect(sanitized).toContain('"password":"[REDACTED]"');
      expect(sanitized).toContain('"passwordHash":"[REDACTED]"');
      expect(sanitized).toContain('"token":"[REDACTED]"');
      expect(sanitized).toContain('admin@example.com');
    });

    it('handles empty or null params safely', () => {
      expect(service.sanitizeParams(null)).toBe('[]');
      expect(service.sanitizeParams(undefined)).toBe('[]');
      expect(service.sanitizeParams('')).toBe('[]');
    });
  });

  describe('Connection Pooling & Pooler Resolution', () => {
    it('returns undefined when no database URL is available', () => {
      const resolved = PrismaService.resolveDatasourceUrl(undefined, '');
      expect(resolved).toBeUndefined();
    });

    it('returns raw URL untouched if protocol is not postgresql/postgres', () => {
      const raw = 'mysql://user:pass@localhost:3306/db';
      const resolved = PrismaService.resolveDatasourceUrl(undefined, raw);
      expect(resolved).toBe(raw);
    });

    it('appends connection_limit, pool_timeout, and connect_timeout from configService', () => {
      const raw =
        'postgresql://user:pass@localhost:5432/ojs_nutrition?schema=public';
      const mockConfigService = {
        get: jest.fn((key: string) => {
          if (key === 'database') {
            return {
              url: raw,
              connectionLimit: 15,
              poolTimeout: 25,
              connectTimeout: 7,
            };
          }
          if (key === 'databaseUrl') return raw;
          return undefined;
        }),
      };

      const resolved = PrismaService.resolveDatasourceUrl(
        mockConfigService as never,
      );
      expect(resolved).toBeDefined();
      const parsed = new URL(resolved!);
      expect(parsed.searchParams.get('connection_limit')).toBe('15');
      expect(parsed.searchParams.get('pool_timeout')).toBe('25');
      expect(parsed.searchParams.get('connect_timeout')).toBe('7');
      expect(parsed.searchParams.get('schema')).toBe('public');
    });

    it('does not overwrite existing connection_limit in URL', () => {
      const raw =
        'postgresql://user:pass@localhost:5432/ojs_nutrition?connection_limit=50';
      const mockConfigService = {
        get: jest.fn((key: string) => {
          if (key === 'database') {
            return {
              connectionLimit: 10,
            };
          }
          return undefined;
        }),
      };

      const resolved = PrismaService.resolveDatasourceUrl(
        mockConfigService as never,
        raw,
      );
      const parsed = new URL(resolved!);
      expect(parsed.searchParams.get('connection_limit')).toBe('50');
    });

    it('automatically sets pgbouncer=true when connecting to transaction pooler port 6543', () => {
      const poolerUrl =
        'postgresql://postgres.ref:secret@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';
      const resolved = PrismaService.resolveDatasourceUrl(undefined, poolerUrl);
      expect(resolved).toBeDefined();
      const parsed = new URL(resolved!);
      expect(parsed.searchParams.get('pgbouncer')).toBe('true');
    });

    it('automatically sets pgbouncer=true when connecting to standard pgbouncer port 6432', () => {
      const poolerUrl =
        'postgresql://postgres.ref:secret@db.internal:6432/postgres';
      const resolved = PrismaService.resolveDatasourceUrl(undefined, poolerUrl);
      expect(resolved).toBeDefined();
      const parsed = new URL(resolved!);
      expect(parsed.searchParams.get('pgbouncer')).toBe('true');
    });

    it('automatically sets pgbouncer=true when hostname is pooler.supabase.com', () => {
      const poolerUrl =
        'postgresql://postgres.ref:secret@pooler.supabase.com/postgres';
      const resolved = PrismaService.resolveDatasourceUrl(undefined, poolerUrl);
      expect(resolved).toBeDefined();
      const parsed = new URL(resolved!);
      expect(parsed.searchParams.get('pgbouncer')).toBe('true');
    });

    it('automatically sets pgbouncer=true when config or env requests pgbouncer explicitly', () => {
      const rawUrl = 'postgresql://user:pass@localhost:5432/db';
      const mockConfigService = {
        get: jest.fn((key: string) => {
          if (key === 'database') {
            return { pgbouncer: true };
          }
          return undefined;
        }),
      };
      const resolved = PrismaService.resolveDatasourceUrl(
        mockConfigService as never,
        rawUrl,
      );
      expect(resolved).toBeDefined();
      const parsed = new URL(resolved!);
      expect(parsed.searchParams.get('pgbouncer')).toBe('true');
    });

    it('generates a safe connection summary without sensitive credentials', () => {
      const raw =
        'postgresql://admin:superSecretPass123@db.supabase.com:5432/ojs_nutrition?connection_limit=20&pool_timeout=15';
      const customService = new PrismaService(undefined, {
        get: (key: string) =>
          key === 'databaseUrl'
            ? raw
            : key === 'database'
              ? { transactionTimeout: 12000, transactionMaxWait: 4000 }
              : undefined,
      } as never);

      const summary = customService.getSafeConnectionSummary();
      expect(summary).toBeDefined();
      expect(summary?.host).toBe('db.supabase.com');
      expect(summary?.port).toBe('5432');
      expect(summary?.database).toBe('ojs_nutrition');
      expect(summary?.connectionLimit).toBe('20');
      expect(summary?.poolTimeout).toBe('15');
      expect(summary?.pgbouncer).toBe(false);
      expect(summary?.transactionTimeout).toBe(12000);
      expect(summary?.transactionMaxWait).toBe(4000);

      expect(JSON.stringify(summary)).not.toContain('superSecretPass123');
      expect(JSON.stringify(summary)).not.toContain('admin');
    });

    it('executes executeTransaction with default and custom options', async () => {
      const txMock = {} as Prisma.TransactionClient;
      const txSpy = jest
        .spyOn(service, '$transaction')
        .mockImplementation(
          (
            cb:
              ((tx: Prisma.TransactionClient) => Promise<unknown>) | unknown[],
            opts?: unknown,
          ) => {
            if (typeof cb === 'function') {
              return cb(txMock);
            }
            return Promise.resolve(opts);
          },
        );

      const callback = jest.fn().mockResolvedValue('tx-result');
      const result = await service.executeTransaction(callback, {
        timeout: 20000,
      });

      expect(result).toBe('tx-result');
      expect(callback).toHaveBeenCalledWith(txMock);
      expect(txSpy).toHaveBeenCalledWith(callback, {
        timeout: 20000,
        maxWait: 5000,
        isolationLevel: undefined,
      });
    });

    it('logs pool configuration on onModuleInit without throwing', async () => {
      const loggerLogSpy = jest
        .spyOn(
          (service as unknown as { logger: { log: jest.Mock } }).logger,
          'log',
        )
        .mockImplementation();

      await service.onModuleInit();
      expect(connectSpy).toHaveBeenCalled();
      loggerLogSpy.mockRestore();
    });
  });
});
