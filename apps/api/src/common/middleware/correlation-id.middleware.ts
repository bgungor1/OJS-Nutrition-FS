import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { CORRELATION_ID_HEADER, REQUEST_ID_HEADER } from '../constants';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const incoming =
      this.extractHeader(req, CORRELATION_ID_HEADER) ??
      this.extractHeader(req, REQUEST_ID_HEADER) ??
      randomUUID();

    (req as Request & { correlationId: string }).correlationId = incoming;

    res.setHeader(CORRELATION_ID_HEADER, incoming);

    next();
  }

  private extractHeader(req: Request, name: string): string | undefined {
    const raw = req.headers[name];
    if (!raw) return undefined;
    const value = Array.isArray(raw) ? raw[0] : raw;
    return value?.trim() || undefined;
  }
}
