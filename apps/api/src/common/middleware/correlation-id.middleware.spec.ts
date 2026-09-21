import type { NextFunction, Request, Response } from 'express';
import { CorrelationIdMiddleware } from './correlation-id.middleware';
import { CORRELATION_ID_HEADER } from '../constants';

describe('CorrelationIdMiddleware', () => {
  let middleware: CorrelationIdMiddleware;
  let mockRes: jest.Mocked<Pick<Response, 'setHeader'>>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    middleware = new CorrelationIdMiddleware();
    mockRes = { setHeader: jest.fn() } as unknown as jest.Mocked<
      Pick<Response, 'setHeader'>
    >;
    mockNext = jest.fn();
  });

  it('should use X-Correlation-ID header if present', () => {
    const existingId = 'test-correlation-id-123';
    const req = {
      headers: { [CORRELATION_ID_HEADER]: existingId },
    } as unknown as Request;

    middleware.use(req, mockRes as unknown as Response, mockNext);

    expect((req as Request & { correlationId: string }).correlationId).toBe(
      existingId,
    );
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      CORRELATION_ID_HEADER,
      existingId,
    );
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('should use X-Request-ID when X-Correlation-ID is missing', () => {
    const requestId = 'req-id-abc';
    const req = {
      headers: { 'x-request-id': requestId },
    } as unknown as Request;

    middleware.use(req, mockRes as unknown as Response, mockNext);

    expect((req as Request & { correlationId: string }).correlationId).toBe(
      requestId,
    );
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      CORRELATION_ID_HEADER,
      requestId,
    );
  });

  it('should generate UUID and add to response when neither header is present', () => {
    const req = { headers: {} } as unknown as Request;

    middleware.use(req, mockRes as unknown as Response, mockNext);

    const generatedId = (req as Request & { correlationId: string })
      .correlationId;
    expect(generatedId).toBeDefined();
    expect(generatedId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      CORRELATION_ID_HEADER,
      generatedId,
    );
  });

  it('should take only the first value if header is an array', () => {
    const firstId = 'first-id';
    const req = {
      headers: { [CORRELATION_ID_HEADER]: [firstId, 'second-id'] },
    } as unknown as Request;

    middleware.use(req, mockRes as unknown as Response, mockNext);

    expect((req as Request & { correlationId: string }).correlationId).toBe(
      firstId,
    );
  });

  it('should trigger UUID generation on blank string header', () => {
    const req = {
      headers: { [CORRELATION_ID_HEADER]: '   ' },
    } as unknown as Request;

    middleware.use(req, mockRes as unknown as Response, mockNext);

    const generatedId = (req as Request & { correlationId: string })
      .correlationId;
    expect(generatedId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it('should call next() in all cases', () => {
    const req = { headers: {} } as unknown as Request;
    middleware.use(req, mockRes as unknown as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith();
  });
});
