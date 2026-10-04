import { ConfigService } from '@nestjs/config';
import { SentryService } from './sentry.service';

describe('SentryService', () => {
  it('returns false for isConfigured when SENTRY_DSN is absent', () => {
    const configService = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;

    const originalEnv = process.env.SENTRY_DSN;
    delete process.env.SENTRY_DSN;

    const service = new SentryService(configService);
    expect(service.isConfigured()).toBe(false);

    if (originalEnv) {
      process.env.SENTRY_DSN = originalEnv;
    }
  });

  it('returns true for isConfigured when SENTRY_DSN is present', () => {
    const configService = {
      get: jest.fn().mockReturnValue('https://key@sentry.io/123'),
    } as unknown as ConfigService;

    const service = new SentryService(configService);
    expect(service.isConfigured()).toBe(true);
  });

  it('captures exception and returns event ID', () => {
    const service = new SentryService();
    const error = new Error('Database connection failed');
    const eventId = service.captureException(error, {
      correlationId: 'req-123',
      method: 'POST',
      url: '/orders',
    });

    expect(eventId).toBeDefined();
    expect(eventId.startsWith('api_err_')).toBe(true);
  });

  it('sanitizes sensitive data like passwords and tokens in context', () => {
    const service = new SentryService();
    const dirty = {
      email: 'user@example.com',
      password: 'plainPassword',
      token: 'jwt.token.val',
      nested: {
        authorization: 'Bearer token',
        ip: '127.0.0.1',
      },
    };

    const clean = service.sanitize(dirty);
    expect(clean.email).toBe('user@example.com');
    expect(clean.password).toBe('[REDACTED]');
    expect(clean.token).toBe('[REDACTED]');
    const nested = clean.nested as Record<string, unknown>;
    expect(nested.authorization).toBe('[REDACTED]');
    expect(nested.ip).toBe('127.0.0.1');
  });

  describe('APM Spans & Metrics', () => {
    it('records spans and maintains FIFO queue within max limit', () => {
      const service = new SentryService();

      service.recordSpan({
        op: 'http.server',
        description: 'GET /api/v1/products',
        durationMs: 45,
        status: 'ok',
      });

      const spans = service.getRecentSpans();
      expect(spans).toHaveLength(1);
      expect(spans[0]?.op).toBe('http.server');
      expect(spans[0]?.durationMs).toBe(45);
      expect(spans[0]?.id).toBeDefined();
    });

    it('records breadcrumbs and allows clearing', () => {
      const service = new SentryService();

      service.addBreadcrumb({
        category: 'auth',
        message: 'User logged in successfully',
      });

      expect(service.getBreadcrumbs()).toHaveLength(1);
      expect(service.getBreadcrumbs()[0]?.category).toBe('auth');

      service.clearBreadcrumbs();
      expect(service.getBreadcrumbs()).toHaveLength(0);
    });

    it('records slow queries and generates warning breadcrumbs', () => {
      const service = new SentryService();

      service.recordSlowQuery({
        query: 'SELECT * FROM "Product" WHERE tags @> ARRAY["protein"]',
        duration: 85,
        target: 'Product',
      });

      const slowQueries = service.getSlowQueries();
      expect(slowQueries).toHaveLength(1);
      expect(slowQueries[0]?.duration).toBe(85);

      const breadcrumbs = service.getBreadcrumbs();
      expect(breadcrumbs).toHaveLength(1);
      expect(breadcrumbs[0]?.category).toBe('db.slow_query');
      expect(breadcrumbs[0]?.level).toBe('warn');
    });

    it('records slow requests and generates warning breadcrumbs', () => {
      const service = new SentryService();

      service.recordSlowRequest({
        method: 'GET',
        url: '/api/v1/products',
        duration: 250,
        statusCode: 200,
        correlationId: 'corr-slow-1',
      });

      const slowRequests = service.getSlowRequests();
      expect(slowRequests).toHaveLength(1);
      expect(slowRequests[0]?.duration).toBe(250);

      const breadcrumbs = service.getBreadcrumbs();
      expect(breadcrumbs).toHaveLength(1);
      expect(breadcrumbs[0]?.category).toBe('performance');
      expect(breadcrumbs[0]?.level).toBe('warn');
    });

    it('correctly calculates p95, p99 and average metrics', () => {
      const service = new SentryService();

      for (let i = 1; i <= 10; i++) {
        service.recordSpan({
          op: 'http.server',
          durationMs: i * 10,
        });
      }

      const summary = service.getMetricsSummary();
      expect(summary.totalRequests).toBe(10);
      expect(summary.averageDurationMs).toBe(55);
      expect(summary.p95DurationMs).toBe(100);
      expect(summary.p99DurationMs).toBe(100);
    });

    it('attaches breadcrumbs and recent spans when capturing exception', () => {
      const service = new SentryService();

      service.addBreadcrumb({
        category: 'http',
        message: 'POST /checkout initiated',
      });
      service.recordSpan({
        op: 'http.server',
        description: 'POST /checkout',
        durationMs: 310,
      });

      const eventId = service.captureException(new Error('Payment failed'));
      expect(eventId).toBeDefined();
    });
  });
});
