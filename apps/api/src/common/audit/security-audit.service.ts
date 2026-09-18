import { Injectable, Logger } from '@nestjs/common';
import {
  AuditEvent,
  AuditLogLevel,
  SecurityAuditEntry,
} from './audit-event.enum';

const SENSITIVE_KEY_PATTERNS = [
  'password',
  'passwordhash',
  'password2',
  'token',
  'refreshtoken',
  'accesstoken',
  'secret',
  'secretkey',
  'apikey',
  'cardnumber',
  'cvv',
  'cardholder',
  'pan',
  'authorization',
];

@Injectable()
export class SecurityAuditService {
  private readonly logger = new Logger('SecurityAudit');

  record(params: {
    event: AuditEvent;
    level?: AuditLogLevel;
    ip?: string;
    userId?: string;
    resourceId?: string;
    details?: Record<string, unknown>;
  }): SecurityAuditEntry {
    const level = params.level ?? this.getDefaultLevelForEvent(params.event);

    const entry: SecurityAuditEntry = {
      timestamp: new Date().toISOString(),
      level,
      event: params.event,
      ...(params.ip ? { ip: params.ip } : {}),
      ...(params.userId ? { userId: params.userId } : {}),
      ...(params.resourceId ? { resourceId: params.resourceId } : {}),
      ...(params.details
        ? { details: this.sanitizeDetails(params.details) }
        : {}),
    };

    const formattedLog = `[SECURITY_AUDIT] ${JSON.stringify(entry)}`;

    switch (level) {
      case AuditLogLevel.SECURITY_ALARM:
        this.logger.error(formattedLog);
        break;
      case AuditLogLevel.WARN:
        this.logger.warn(formattedLog);
        break;
      case AuditLogLevel.INFO:
      default:
        this.logger.log(formattedLog);
        break;
    }

    return entry;
  }

  info(
    event: AuditEvent,
    payload?: {
      ip?: string;
      userId?: string;
      resourceId?: string;
      details?: Record<string, unknown>;
    },
  ): SecurityAuditEntry {
    return this.record({ ...payload, event, level: AuditLogLevel.INFO });
  }

  warn(
    event: AuditEvent,
    payload?: {
      ip?: string;
      userId?: string;
      resourceId?: string;
      details?: Record<string, unknown>;
    },
  ): SecurityAuditEntry {
    return this.record({ ...payload, event, level: AuditLogLevel.WARN });
  }

  alarm(
    event: AuditEvent,
    payload?: {
      ip?: string;
      userId?: string;
      resourceId?: string;
      details?: Record<string, unknown>;
    },
  ): SecurityAuditEntry {
    return this.record({
      ...payload,
      event,
      level: AuditLogLevel.SECURITY_ALARM,
    });
  }

  private getDefaultLevelForEvent(event: AuditEvent): AuditLogLevel {
    switch (event) {
      case AuditEvent.AUTH_TOKEN_REUSE_DETECTED:
      case AuditEvent.PAYMENT_WEBHOOK_HMAC_INVALID:
        return AuditLogLevel.SECURITY_ALARM;

      case AuditEvent.AUTH_LOGIN_FAILED:
      case AuditEvent.ORDER_CANCELLED_RESTOCKED:
      case AuditEvent.RATE_LIMIT_EXCEEDED:
      case AuditEvent.ADMIN_ACCESS_DENIED:
      case AuditEvent.MEDIA_REJECTED:
        return AuditLogLevel.WARN;

      default:
        return AuditLogLevel.INFO;
    }
  }

  private sanitizeDetails(
    obj: Record<string, unknown>,
    seen = new WeakSet<object>(),
  ): Record<string, unknown> {
    if (seen.has(obj)) {
      return { '[CIRCULAR]': true };
    }
    seen.add(obj);

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');

      if (
        SENSITIVE_KEY_PATTERNS.some((pattern) =>
          normalizedKey.includes(pattern),
        )
      ) {
        sanitized[key] = '[REDACTED]';
      } else if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        sanitized[key] = this.sanitizeDetails(
          value as Record<string, unknown>,
          seen,
        );
      } else if (Array.isArray(value)) {
        sanitized[key] = (value as unknown[]).map((item: unknown): unknown => {
          if (
            item !== null &&
            typeof item === 'object' &&
            !(item instanceof Date)
          ) {
            return this.sanitizeDetails(item as Record<string, unknown>, seen);
          }
          return item;
        });
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}
