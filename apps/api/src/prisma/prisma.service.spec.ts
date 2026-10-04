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
});
