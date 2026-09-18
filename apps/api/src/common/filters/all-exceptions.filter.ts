import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  Optional,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuditEvent, SecurityAuditService } from '../audit';
import { CORRELATION_ID_HEADER } from '../constants';

interface ErrorResponseBody {
  status: 'error';
  statusCode: number;
  correlationId?: string;
  message?: string;
  reason?: Record<string, string[]>;
}

/**
 * Tüm hataları tek şekle çevirir:
 *  - alan bazlı (validation/auth): `{ status: 'error', reason: { field: [msg] } }`
 *  - genel:                        `{ status: 'error', message: string }`
 * Bkz. BACKEND_PLAN §3.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(
    @Optional() private readonly auditService?: SecurityAuditService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status: HttpStatus = this.resolveHttpStatus(exception);

    const correlationId =
      (request as Request & { correlationId?: string }).correlationId ??
      ((
        response as Response & { getHeader?: (name: string) => unknown }
      ).getHeader?.(CORRELATION_ID_HEADER) as string | undefined);

    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      this.auditService?.warn(AuditEvent.RATE_LIMIT_EXCEEDED, {
        ip: request.ip,
        details: {
          method: request.method,
          url: request.url,
          correlationId,
        },
      });
    }

    const body = this.buildBody(exception, status, correlationId);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `[${correlationId ?? '-'}] ${request.method} ${request.url} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json(body);
  }

  private resolveHttpStatus(exception: unknown): HttpStatus {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    if (
      exception &&
      typeof exception === 'object' &&
      'statusCode' in exception &&
      typeof (exception as { statusCode: unknown }).statusCode === 'number'
    ) {
      return (exception as { statusCode: number }).statusCode;
    }
    if (
      exception &&
      typeof exception === 'object' &&
      'status' in exception &&
      typeof (exception as { status: unknown }).status === 'number'
    ) {
      return (exception as { status: number }).status;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private buildBody(
    exception: unknown,
    status: HttpStatus,
    correlationId?: string,
  ): ErrorResponseBody {
    const base = {
      status: 'error' as const,
      statusCode: status,
      correlationId,
    };

    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      return {
        ...base,
        message:
          'Çok fazla istek gönderildi. Lütfen bir süre sonra tekrar deneyiniz.',
      };
    }

    if (status === HttpStatus.PAYLOAD_TOO_LARGE) {
      return {
        ...base,
        message: 'İstek boyutu sınırı aşıldı (Payload Too Large).',
      };
    }

    if (!(exception instanceof HttpException)) {
      return { ...base, message: 'Beklenmeyen bir hata oluştu.' };
    }

    const payload = exception.getResponse();

    if (typeof payload === 'string') {
      return { ...base, message: payload };
    }

    const { message } = payload as { message?: string | string[] };

    if (Array.isArray(message)) {
      return { ...base, reason: this.groupByField(message) };
    }

    return {
      ...base,
      message: message ?? this.defaultMessageFor(status),
    };
  }

  private groupByField(messages: string[]): Record<string, string[]> {
    return messages.reduce<Record<string, string[]>>((acc, raw) => {
      const field = raw.split(' ')[0] || 'non_field_errors';
      (acc[field] ??= []).push(raw);
      return acc;
    }, {});
  }

  private defaultMessageFor(status: HttpStatus): string {
    if (status === HttpStatus.UNAUTHORIZED)
      return 'Kimlik doğrulaması gerekli.';
    if (status === HttpStatus.FORBIDDEN) return 'Bu işlem için yetkiniz yok.';
    if (status === HttpStatus.NOT_FOUND) return 'Kayıt bulunamadı.';
    return 'İstek işlenemedi.';
  }
}
