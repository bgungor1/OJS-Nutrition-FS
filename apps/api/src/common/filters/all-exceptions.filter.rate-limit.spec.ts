import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { AuditEvent } from '../audit';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter - Rate Limiting & 429', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: {
    status: jest.Mock;
    json: jest.Mock;
  };
  let mockRequest: {
    method: string;
    url: string;
    ip?: string;
    correlationId?: string;
  };
  let mockAuditService: {
    warn: jest.Mock;
  };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    mockAuditService = {
      warn: jest.fn(),
    };

    filter = new AllExceptionsFilter(mockAuditService as never);

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      method: 'POST',
      url: '/api/v1/contact',
      ip: '198.51.100.1',
    };

    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return standard rate limit message and record RATE_LIMIT_EXCEEDED audit log on 429', () => {
    const exception = new HttpException(
      'ThrottlerException: Too Many Requests',
      HttpStatus.TOO_MANY_REQUESTS,
    );

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.TOO_MANY_REQUESTS,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      correlationId: undefined,
      message:
        'Çok fazla istek gönderildi. Lütfen bir süre sonra tekrar deneyiniz.',
    });
    expect(mockAuditService.warn).toHaveBeenCalledWith(
      AuditEvent.RATE_LIMIT_EXCEEDED,
      {
        ip: '198.51.100.1',
        details: {
          method: 'POST',
          url: '/api/v1/contact',
          correlationId: undefined,
        },
      },
    );
  });

  it('should return 429 without throwing even when auditService is not injected', () => {
    const filterWithoutAudit = new AllExceptionsFilter();

    const exception = new HttpException(
      'Too Many Requests',
      HttpStatus.TOO_MANY_REQUESTS,
    );

    expect(() => {
      filterWithoutAudit.catch(exception, mockHost);
    }).not.toThrow();

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.TOO_MANY_REQUESTS,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      correlationId: undefined,
      message:
        'Çok fazla istek gönderildi. Lütfen bir süre sonra tekrar deneyiniz.',
    });
  });
});
