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
import { AuditEvent } from '../audit';

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

  describe('HttpException İşleme', () => {
    it('string payload içeren HttpException için standart hata zarfı dönmeli', () => {
      const exception = new HttpException(
        'Kayıt bulunamadı',
        HttpStatus.NOT_FOUND,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Kayıt bulunamadı',
      });
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });

    it('nesne payload ve tekil mesaj içeren HttpException için mesajı dönmeli', () => {
      const exception = new BadRequestException({
        message: 'Geçersiz parametre değeri',
      });

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Geçersiz parametre değeri',
      });
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });

    it('class-validator dizi mesajlarını alan bazlı reason nesnesine gruplamalı', () => {
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
        reason: {
          email: ['email must be an email', 'email should not be empty'],
          first_name: ['first_name en az 2 karakter olmalıdır.'],
        },
      });
      expect(loggerErrorSpy).not.toHaveBeenCalled();
    });

    it('mesajı boş nesne payload durumunda status koduna göre varsayılan mesaj dönmeli', () => {
      filter.catch(new UnauthorizedException({}), mockHost);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Kimlik doğrulaması gerekli.',
      });

      filter.catch(new ForbiddenException({}), mockHost);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Bu işlem için yetkiniz yok.',
      });

      filter.catch(new NotFoundException({}), mockHost);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Kayıt bulunamadı.',
      });

      filter.catch(new ConflictException({}), mockHost);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'İstek işlenemedi.',
      });
    });
  });

  describe('Bilinmeyen & 500 Hataları İşleme (Zero Leaks)', () => {
    it('standart Error fırlatıldığında 500 status ve güvenli genel mesaj dönmeli, loglamalı', () => {
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
        message: 'Beklenmeyen bir hata oluştu.',
      });
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'POST /api/v1/orders -> 500',
        internalError.stack,
      );
    });

    it('primitif değer (string/sayı) fırlatıldığında da 500 dönmeli ve string olarak loglamalı', () => {
      filter.catch('Beklenmeyen bir string fırlatıldı', mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Beklenmeyen bir hata oluştu.',
      });
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'GET /api/v1/test -> 500',
        'Beklenmeyen bir string fırlatıldı',
      );
    });
  });

  describe('429 Too Many Requests & Rate Limiting', () => {
    it('429 durumunda standart Türkçe hata mesajı dönmeli ve RATE_LIMIT_EXCEEDED audit logu düşmeli', () => {
      mockRequest.method = 'POST';
      mockRequest.url = '/api/v1/contact';
      mockRequest.ip = '198.51.100.1';

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
          },
        },
      );
    });

    it('auditService enjekte edilmediğinde de hata fırlatmadan 429 dönmeli', () => {
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
        message:
          'Çok fazla istek gönderildi. Lütfen bir süre sonra tekrar deneyiniz.',
      });
    });
  });
});
