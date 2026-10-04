import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError, lastValueFrom } from 'rxjs';
import {
  PerformanceInterceptor,
  SLOW_API_THRESHOLD_MS,
} from './performance.interceptor';
import { SentryService } from '../observability/sentry.service';

describe('PerformanceInterceptor', () => {
  let interceptor: PerformanceInterceptor;
  let mockSentryService: {
    recordSpan: jest.Mock;
    addBreadcrumb: jest.Mock;
    recordSlowRequest: jest.Mock;
  };
  let mockRequest: {
    method: string;
    url: string;
    originalUrl?: string;
    correlationId?: string;
    headers: Record<string, string>;
  };
  let mockResponse: {
    statusCode: number;
    headersSent: boolean;
    setHeader: jest.Mock;
  };
  let mockContext: ExecutionContext;
  let loggerWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    mockSentryService = {
      recordSpan: jest.fn(),
      addBreadcrumb: jest.fn(),
      recordSlowRequest: jest.fn(),
    };

    mockRequest = {
      method: 'GET',
      url: '/api/v1/products',
      originalUrl: '/api/v1/products?limit=10',
      correlationId: 'req-corr-123',
      headers: {},
    };

    mockResponse = {
      statusCode: 200,
      headersSent: false,
      setHeader: jest.fn(),
    };

    mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as unknown as ExecutionContext;

    interceptor = new PerformanceInterceptor(
      mockSentryService as unknown as SentryService,
    );

    loggerWarnSpy = jest
      .spyOn(
        (interceptor as unknown as { logger: { warn: jest.Mock } }).logger,
        'warn',
      )
      .mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('sets X-Response-Time header on successful response', async () => {
    const next: CallHandler = { handle: () => of({ test: 'ok' }) };

    await lastValueFrom(interceptor.intercept(mockContext, next));

    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'X-Response-Time',
      expect.stringMatching(/^\d+ms$/),
    );
    expect(mockSentryService.recordSpan).toHaveBeenCalledWith(
      expect.objectContaining({
        op: 'http.server',
        description: 'GET /api/v1/products?limit=10',
        status: 'ok',
      }),
    );
    expect(mockSentryService.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'http',
      }),
    );
    expect(loggerWarnSpy).not.toHaveBeenCalled();
  });

  it('does not set header if headers have already been sent', async () => {
    mockResponse.headersSent = true;
    const next: CallHandler = { handle: () => of({ test: 'ok' }) };

    await lastValueFrom(interceptor.intercept(mockContext, next));

    expect(mockResponse.setHeader).not.toHaveBeenCalled();
    expect(mockSentryService.recordSpan).toHaveBeenCalled();
  });

  it('logs warning and records slow request when duration exceeds threshold', async () => {
    const next: CallHandler = { handle: () => of({ test: 'ok' }) };

    const realDateNow = Date.now;
    let callCount = 0;
    jest.spyOn(Date, 'now').mockImplementation(() => {
      callCount++;
      return callCount === 1 ? 1000 : 1000 + SLOW_API_THRESHOLD_MS + 50;
    });

    try {
      await lastValueFrom(interceptor.intercept(mockContext, next));

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `[Slow API Request >= ${SLOW_API_THRESHOLD_MS}ms] GET /api/v1/products?limit=10 200 in 250ms (Correlation ID: req-corr-123)`,
        ),
      );
      expect(mockSentryService.recordSlowRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/api/v1/products?limit=10',
          duration: 250,
          statusCode: 200,
          correlationId: 'req-corr-123',
        }),
      );
    } finally {
      Date.now = realDateNow;
    }
  });

  it('records metrics and span even if request pipeline throws an error', async () => {
    mockResponse.statusCode = 500;
    const next: CallHandler = {
      handle: () => throwError(() => new Error('Unexpected service error')),
    };

    await expect(
      lastValueFrom(interceptor.intercept(mockContext, next)),
    ).rejects.toThrow('Unexpected service error');

    expect(mockSentryService.recordSpan).toHaveBeenCalledWith(
      expect.objectContaining({
        op: 'http.server',
        status: 'internal_error',
      }),
    );
  });
});
