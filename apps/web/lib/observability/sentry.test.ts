import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  captureException,
  captureMessage,
  setSentryUser,
  getSentryUser,
  addBreadcrumb,
  getBreadcrumbs,
  clearBreadcrumbs,
  sanitizeErrorContext,
  isSentryEnabled,
} from './sentry';

describe('Sentry Observability Module', () => {
  beforeEach(() => {
    clearBreadcrumbs();
    setSentryUser(null);
    vi.restoreAllMocks();
  });

  it('captures an exception and returns a valid event ID', () => {
    const error = new Error('Test run error');
    const eventId = captureException(error, {
      tags: { section: 'checkout' },
      extra: { cartId: 'cart-123' },
    });

    expect(eventId).toBeDefined();
    expect(eventId.startsWith('err_')).toBe(true);
  });

  it('captures a custom message with severity level', () => {
    const eventId = captureMessage('User completed payment', 'info', {
      tags: { order: '123' },
    });

    expect(eventId).toBeDefined();
    expect(eventId.startsWith('msg_')).toBe(true);
  });

  it('manages user context correctly', () => {
    expect(getSentryUser()).toBeNull();

    setSentryUser({ id: 'user-1', email: 'test@example.com', role: 'customer' });
    expect(getSentryUser()?.id).toBe('user-1');

    setSentryUser(null);
    expect(getSentryUser()).toBeNull();
  });

  it('manages breadcrumbs and caps at max limit', () => {
    addBreadcrumb({ category: 'navigation', message: 'User navigated to /products' });
    expect(getBreadcrumbs().length).toBe(1);
    expect(getBreadcrumbs()[0].category).toBe('navigation');

    for (let i = 0; i < 30; i++) {
      addBreadcrumb({ category: 'action', message: `Step ${i}` });
    }

    expect(getBreadcrumbs().length).toBeLessThanOrEqual(25);
  });

  it('sanitizes sensitive data like passwords, tokens and card numbers', () => {
    const dirtyData = {
      username: 'johndoe',
      password: 'superSecretPassword123',
      token: 'jwt.token.here',
      cardNumber: '4543123456789012',
      nested: {
        cvv: '123',
        normalInfo: 'all good',
      },
    };

    const clean = sanitizeErrorContext(dirtyData);

    expect(clean.username).toBe('johndoe');
    expect(clean.password).toBe('[REDACTED]');
    expect(clean.token).toBe('[REDACTED]');
    expect(clean.cardNumber).toBe('[REDACTED]');
    expect((clean.nested as Record<string, unknown>).cvv).toBe('[REDACTED]');
    expect((clean.nested as Record<string, unknown>).normalInfo).toBe('all good');
  });

  it('checks if Sentry is enabled based on environment variables', () => {
    const originalEnv = process.env.NEXT_PUBLIC_SENTRY_DSN;
    try {
      delete process.env.NEXT_PUBLIC_SENTRY_DSN;
      delete process.env.SENTRY_DSN;
      expect(isSentryEnabled()).toBe(false);

      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://abc@sentry.io/123';
      expect(isSentryEnabled()).toBe(true);
    } finally {
      if (originalEnv) {
        process.env.NEXT_PUBLIC_SENTRY_DSN = originalEnv;
      } else {
        delete process.env.NEXT_PUBLIC_SENTRY_DSN;
      }
    }
  });
});
