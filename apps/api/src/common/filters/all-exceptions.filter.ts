import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorResponseBody {
  status: 'error';
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

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // HttpException.getStatus() number döner ama değeri her zaman bir HttpStatus'tur.
    const status: HttpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const body = this.buildBody(exception, status);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json(body);
  }

  private buildBody(exception: unknown, status: HttpStatus): ErrorResponseBody {
    if (!(exception instanceof HttpException)) {
      return { status: 'error', message: 'Beklenmeyen bir hata oluştu.' };
    }

    const payload = exception.getResponse();

    if (typeof payload === 'string') {
      return { status: 'error', message: payload };
    }

    const { message } = payload as { message?: string | string[] };

    // class-validator ValidationPipe -> message: string[]
    if (Array.isArray(message)) {
      return { status: 'error', reason: this.groupByField(message) };
    }

    return {
      status: 'error',
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
