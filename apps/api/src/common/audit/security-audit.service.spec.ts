import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuditEvent, AuditLogLevel } from './audit-event.enum';
import { SecurityAuditService } from './security-audit.service';

describe('SecurityAuditService', () => {
  let service: SecurityAuditService;
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecurityAuditService],
    }).compile();

    service = module.get<SecurityAuditService>(SecurityAuditService);

    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('servis başarıyla tanımlanmalıdır', () => {
    expect(service).toBeDefined();
  });

  describe('record() and level-based logging', () => {
    it('INFO seviyesinde yapısal log yazmalıdır', () => {
      const result = service.record({
        event: AuditEvent.AUTH_LOGIN_SUCCESS,
        level: AuditLogLevel.INFO,
        userId: 'user-123',
        ip: '127.0.0.1',
        details: { email: 'test@example.com' },
      });

      expect(result.event).toBe(AuditEvent.AUTH_LOGIN_SUCCESS);
      expect(result.level).toBe(AuditLogLevel.INFO);
      expect(result.userId).toBe('user-123');
      expect(result.ip).toBe('127.0.0.1');
      expect(result.timestamp).toBeDefined();
      expect(result.details?.email).toBe('test@example.com');

      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('[SECURITY_AUDIT]'),
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('"event":"AUTH_LOGIN_SUCCESS"'),
      );
    });

    it('WARN seviyesinde yapısal log yazmalıdır', () => {
      service.record({
        event: AuditEvent.AUTH_LOGIN_FAILED,
        level: AuditLogLevel.WARN,
        ip: '192.168.1.50',
      });

      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[SECURITY_AUDIT]'),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('"level":"WARN"'),
      );
    });

    it('SECURITY_ALARM seviyesinde logger.error kullanmalıdır', () => {
      service.record({
        event: AuditEvent.AUTH_TOKEN_REUSE_DETECTED,
        level: AuditLogLevel.SECURITY_ALARM,
        userId: 'attacker-user',
      });

      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[SECURITY_AUDIT]'),
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('"level":"SECURITY_ALARM"'),
      );
    });

    it('seviye belirtilmediğinde olaya göre varsayılan seviyeyi seçmelidir', () => {
      const alarmEntry = service.record({
        event: AuditEvent.AUTH_TOKEN_REUSE_DETECTED,
      });
      expect(alarmEntry.level).toBe(AuditLogLevel.SECURITY_ALARM);

      const hmacEntry = service.record({
        event: AuditEvent.PAYMENT_WEBHOOK_HMAC_INVALID,
      });
      expect(hmacEntry.level).toBe(AuditLogLevel.SECURITY_ALARM);

      const failedLogin = service.record({
        event: AuditEvent.AUTH_LOGIN_FAILED,
      });
      expect(failedLogin.level).toBe(AuditLogLevel.WARN);

      const restockEntry = service.record({
        event: AuditEvent.ORDER_CANCELLED_RESTOCKED,
      });
      expect(restockEntry.level).toBe(AuditLogLevel.WARN);

      const registerEntry = service.record({
        event: AuditEvent.AUTH_REGISTER,
      });
      expect(registerEntry.level).toBe(AuditLogLevel.INFO);
    });
  });

  describe('helper methods: info, warn, alarm', () => {
    it('info() metodu INFO seviyesinde kayıt üretmelidir', () => {
      const entry = service.info(AuditEvent.USER_PROFILE_UPDATED, {
        userId: 'usr-1',
        details: { updatedFields: ['firstName'] },
      });

      expect(entry.level).toBe(AuditLogLevel.INFO);
      expect(logSpy).toHaveBeenCalledTimes(1);
    });

    it('warn() metodu WARN seviyesinde kayıt üretmelidir', () => {
      const entry = service.warn(AuditEvent.RATE_LIMIT_EXCEEDED, {
        ip: '10.0.0.1',
      });

      expect(entry.level).toBe(AuditLogLevel.WARN);
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it('alarm() metodu SECURITY_ALARM seviyesinde kayıt üretmelidir', () => {
      const entry = service.alarm(AuditEvent.PAYMENT_WEBHOOK_HMAC_INVALID, {
        resourceId: 'provider-ref-999',
      });

      expect(entry.level).toBe(AuditLogLevel.SECURITY_ALARM);
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('PII ve hassas veri filtreleme (Sanitization)', () => {
    it('şifre, token, kart no ve gizli anahtarları [REDACTED] ile maskelemelidir', () => {
      const entry = service.record({
        event: AuditEvent.AUTH_LOGIN_FAILED,
        details: {
          username: 'user@test.com',
          password: 'plain-text-secret-password',
          passwordHash: '$2b$10$xyz...',
          refreshToken: 'refresh-token-xyz',
          accessToken: 'access-token-abc',
          secretKey: 'live_secret_key_123',
          cardNumber: '4532123456789012',
          cvv: '123',
          nested: {
            apiKey: 'super-api-key',
            safeValue: 'ok-data',
          },
        },
      });

      const details = entry.details!;
      expect(details.username).toBe('user@test.com');
      expect(details.password).toBe('[REDACTED]');
      expect(details.passwordHash).toBe('[REDACTED]');
      expect(details.refreshToken).toBe('[REDACTED]');
      expect(details.accessToken).toBe('[REDACTED]');
      expect(details.secretKey).toBe('[REDACTED]');
      expect(details.cardNumber).toBe('[REDACTED]');
      expect(details.cvv).toBe('[REDACTED]');

      const nested = details.nested as Record<string, unknown>;
      expect(nested.apiKey).toBe('[REDACTED]');
      expect(nested.safeValue).toBe('ok-data');
    });

    it('diziler içindeki hassas nesneleri de maskelemelidir', () => {
      const entry = service.record({
        event: AuditEvent.ORDER_CREATED,
        details: {
          items: [
            { productId: 'prod-1', password: 'nested-pass' },
            { productId: 'prod-2', normalField: 'keep' },
          ],
        },
      });

      const items = entry.details?.items as Array<Record<string, unknown>>;
      expect(items[0].productId).toBe('prod-1');
      expect(items[0].password).toBe('[REDACTED]');
      expect(items[1].normalField).toBe('keep');
    });

    it('döngüsel referans içeren nesneleri güvenle işlemelidir', () => {
      const cyclicObj: Record<string, unknown> = { name: 'cyclic' };
      cyclicObj.self = cyclicObj;

      expect(() => {
        service.record({
          event: AuditEvent.AUTH_REGISTER,
          details: cyclicObj,
        });
      }).not.toThrow();

      expect(logSpy).toHaveBeenCalled();
    });
  });
});
