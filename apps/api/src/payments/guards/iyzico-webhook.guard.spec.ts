import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IyzicoWebhookGuard } from './iyzico-webhook.guard';
import { PaymentsService } from '../payments.service';

describe('IyzicoWebhookGuard', () => {
  let guard: IyzicoWebhookGuard;
  let paymentsService: {
    verifyWebhookSignature: jest.Mock;
  };

  const createMockExecutionContext = (
    headers: Record<string, string | string[] | undefined> = {},
    body: Record<string, unknown> = {},
    rawBody?: Buffer | string,
  ): ExecutionContext => {
    const mockRequest = {
      headers,
      body,
      rawBody,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    paymentsService = {
      verifyWebhookSignature: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IyzicoWebhookGuard,
        {
          provide: PaymentsService,
          useValue: paymentsService,
        },
      ],
    }).compile();

    guard = module.get<IyzicoWebhookGuard>(IyzicoWebhookGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow request when signature is valid', () => {
      paymentsService.verifyWebhookSignature.mockReturnValue(true);

      const context = createMockExecutionContext(
        { 'x-iyzico-signature': 'valid_sig_123' },
        { status: 'SUCCESS' },
      );

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(paymentsService.verifyWebhookSignature).toHaveBeenCalledWith(
        JSON.stringify({ status: 'SUCCESS' }),
        'valid_sig_123',
        undefined,
      );
    });

    it('should support alternative header x-iyzi-signature', () => {
      paymentsService.verifyWebhookSignature.mockReturnValue(true);

      const context = createMockExecutionContext(
        { 'x-iyzi-signature': 'alt_sig_456' },
        { status: 'SUCCESS' },
      );

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(paymentsService.verifyWebhookSignature).toHaveBeenCalledWith(
        JSON.stringify({ status: 'SUCCESS' }),
        'alt_sig_456',
        undefined,
      );
    });

    it('should pass timestamp header when present', () => {
      paymentsService.verifyWebhookSignature.mockReturnValue(true);

      const context = createMockExecutionContext(
        {
          'x-iyzico-signature': 'valid_sig',
          'x-iyzico-timestamp': '1710000000',
        },
        { status: 'SUCCESS' },
      );

      guard.canActivate(context);

      expect(paymentsService.verifyWebhookSignature).toHaveBeenCalledWith(
        JSON.stringify({ status: 'SUCCESS' }),
        'valid_sig',
        '1710000000',
      );
    });

    it('should use Buffer rawBody when available', () => {
      paymentsService.verifyWebhookSignature.mockReturnValue(true);
      const rawBodyBuffer = Buffer.from('{"raw":true}');

      const context = createMockExecutionContext(
        { 'x-iyzico-signature': 'valid_sig' },
        { parsed: true },
        rawBodyBuffer,
      );

      guard.canActivate(context);

      expect(paymentsService.verifyWebhookSignature).toHaveBeenCalledWith(
        '{"raw":true}',
        'valid_sig',
        undefined,
      );
    });

    it('should use string rawBody when available', () => {
      paymentsService.verifyWebhookSignature.mockReturnValue(true);

      const context = createMockExecutionContext(
        { 'x-iyzico-signature': 'valid_sig' },
        { parsed: true },
        '{"stringRaw":true}',
      );

      guard.canActivate(context);

      expect(paymentsService.verifyWebhookSignature).toHaveBeenCalledWith(
        '{"stringRaw":true}',
        'valid_sig',
        undefined,
      );
    });

    it('should throw UnauthorizedException when signature header is missing', () => {
      const context = createMockExecutionContext({}, { status: 'SUCCESS' });

      expect(() => guard.canActivate(context)).toThrow(
        new UnauthorizedException('Missing payment webhook signature.'),
      );
      expect(paymentsService.verifyWebhookSignature).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when signature verification fails', () => {
      paymentsService.verifyWebhookSignature.mockReturnValue(false);

      const context = createMockExecutionContext(
        { 'x-iyzico-signature': 'invalid_sig' },
        { status: 'SUCCESS' },
      );

      expect(() => guard.canActivate(context)).toThrow(
        new UnauthorizedException('Invalid payment webhook signature.'),
      );
    });
  });
});
