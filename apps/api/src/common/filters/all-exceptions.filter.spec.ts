import {
  ArgumentsHost,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
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
  let loggerErrorSpy: jest.SpyInstance;

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
      method: 'GET',
      url: '/api/v1/test',
      ip: '127.0.0.1',
    };

    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;

    loggerErrorSpy = jest
      .spyOn(
        (filter as unknown as { logger: { error: jest.Mock } }).logger,
        'error',
      )
      .mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('HttpException Handling', () => {
    it('should return standard error envelope for HttpException with string payload', () => {
      const exception = new HttpException(
        'Kayıt bulunamadı',
        HttpStatus.NOT_FOUND,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode: HttpStatus.NOT_FOUND,
        correlationId: undefined,
        message: 'Kayıt bulunamadı',
      });
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });

    it('should return message for HttpException with object payload and single message', () => {
      const exception = new BadRequestException({
        message: 'Geçersiz parametre değeri',
      });

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode: HttpStatus.BAD_REQUEST,
        correlationId: undefined,
        message: 'Geçersiz parametre değeri',
      });
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });

    it('should group class-validator array messages into field-based reason object', () => {
      const validationMessages = [
        'email must be an email',
        'email should not be empty',
        'first_name en az 2 karakter olmalıdır.',
      ];
      const exception = new BadRequestException({
        message: validationMessages,
      });

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode: HttpStatus.BAD_REQUEST,
        correlationId: undefined,
        reason: {
          email: ['email must be an email', 'email should not be empty'],
          first_name: ['first_name en az 2 karakter olmalıdır.'],
        },
      });
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });

    it('should return default message according to status code when object payload has empty message', () => {
      filter.catch(new UnauthorizedException({}), mockHost);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode: HttpStatus.UNAUTHORIZED,
        correlationId: undefined,
        message: 'Kimlik doğrulaması gerekli.',
      });

      filter.catch(new ForbiddenException({}), mockHost);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode: HttpStatus.FORBIDDEN,
        correlationId: undefined,
        message: 'Bu işlem için yetkiniz yok.',
      });

      filter.catch(new NotFoundException({}), mockHost);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode: HttpStatus.NOT_FOUND,
        correlationId: undefined,
        message: 'Kayıt bulunamadı.',
      });

      filter.catch(new ConflictException({}), mockHost);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode: HttpStatus.CONFLICT,
        correlationId: undefined,
        message: 'İstek işlenemedi.',
      });
    });

    it('should include correlationId in error envelope when req.correlationId exists', () => {
      mockRequest.correlationId = 'test-corr-id-001';
      filter.catch(new NotFoundException('Test'), mockHost);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ correlationId: 'test-corr-id-001' }),
      );
    });
  });

  describe('Unknown & 500 Error Handling (Zero Leaks)', () => {
    it('should return 500 status and safe generic message, and log when standard Error is thrown', () => {
      mockRequest.method = 'POST';
      mockRequest.url = '/api/v1/orders';
      const internalError = new Error(
        'Database connection timeout at 10.0.0.1',
      );

      filter.catch(internalError, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        correlationId: undefined,
        message: 'Beklenmeyen bir hata oluştu.',
      });
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        '[-] POST /api/v1/orders -> 500',
        internalError.stack,
      );
    });

    it('should return 500 and log as string when primitive value is thrown', () => {
      filter.catch('Beklenmeyen bir string fırlatıldı', mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        correlationId: undefined,
        message: 'Beklenmeyen bir hata oluştu.',
      });
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        '[-] GET /api/v1/test -> 500',
        'Beklenmeyen bir string fırlatıldı',
      );
    });
  });
});
