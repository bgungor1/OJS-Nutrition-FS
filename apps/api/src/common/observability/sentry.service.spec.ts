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
});
