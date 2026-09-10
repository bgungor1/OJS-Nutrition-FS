import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { MockPaymentProvider } from './providers/mock-payment.provider';
import { IyzicoPaymentProvider } from './providers/iyzico-payment.provider';
import { PAYMENT_PROVIDERS, PAYMENT_STATUS } from './payment.constants';
import {
  PaymentChargeRequest,
  PaymentChargeResult,
  PaymentRefundRequest,
  PaymentRefundResult,
} from './interfaces/payment-process.interface';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let mockProvider: MockPaymentProvider;
  let iyzicoProvider: IyzicoPaymentProvider;
  let configService: ConfigService;

  const sampleChargeRequest: PaymentChargeRequest = {
    paymentToken: 'tok_default',
    amount: 1500,
    currency: 'TRY',
    orderNo: 'ORD-2026-001',
    buyer: {
      id: 'usr_1',
      name: 'Berk',
      surname: 'Gungor',
      email: 'berk@example.com',
      registrationAddress: 'Bagdat Caddesi No: 1',
      city: 'Istanbul',
      country: 'Turkey',
      ip: '127.0.0.1',
    },
    shippingAddress: {
      contactName: 'Berk Gungor',
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Bagdat Caddesi No: 1',
    },
    billingAddress: {
      contactName: 'Berk Gungor',
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Bagdat Caddesi No: 1',
    },
    items: [
      {
        id: 'item_1',
        name: 'Whey Protein',
        category: 'Protein',
        price: 1500,
      },
    ],
  };

  const sampleRefundRequest: PaymentRefundRequest = {
    providerRef: 'txn_123',
    amount: 1500,
    currency: 'TRY',
  };

  const mockChargeSuccessResult: PaymentChargeResult = {
    success: true,
    provider: PAYMENT_PROVIDERS.MOCK,
    providerRef: 'mock_pay_1',
    last4: '0008',
    cardType: 'visa',
    rawStatus: PAYMENT_STATUS.SUCCEEDED,
  };

  const mockRefundSuccessResult: PaymentRefundResult = {
    success: true,
    refundId: 'txn_123',
    rawStatus: PAYMENT_STATUS.REFUNDED,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string): string | null => {
              if (key === 'nodeEnv') return 'test';
              return null;
            }),
          },
        },
        {
          provide: MockPaymentProvider,
          useValue: {
            providerName: PAYMENT_PROVIDERS.MOCK,
            charge: jest.fn().mockResolvedValue(mockChargeSuccessResult),
            refund: jest.fn().mockResolvedValue(mockRefundSuccessResult),
            verifyWebhookSignature: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: IyzicoPaymentProvider,
          useValue: {
            providerName: PAYMENT_PROVIDERS.IYZICO,
            isConfigured: jest.fn().mockReturnValue(true),
            charge: jest.fn(),
            refund: jest.fn(),
            verifyWebhookSignature: jest.fn().mockReturnValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    mockProvider = module.get<MockPaymentProvider>(MockPaymentProvider);
    iyzicoProvider = module.get<IyzicoPaymentProvider>(IyzicoPaymentProvider);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('getProvider', () => {
    it('should return mock provider when explicit override is mock', () => {
      const provider = service.getProvider('mock');
      expect(provider).toBe(mockProvider);
    });

    it('should return iyzico provider when explicit override is iyzico', () => {
      const provider = service.getProvider('iyzico');
      expect(provider).toBe(iyzicoProvider);
    });

    it('should return mock provider when NODE_ENV is test', () => {
      jest.spyOn(configService, 'get').mockReturnValue('test');
      const provider = service.getProvider();
      expect(provider).toBe(mockProvider);
    });

    it('should return iyzico provider when in production and iyzico is configured', () => {
      jest.spyOn(configService, 'get').mockReturnValue('production');
      jest.spyOn(iyzicoProvider, 'isConfigured').mockReturnValue(true);

      const provider = service.getProvider();
      expect(provider).toBe(iyzicoProvider);
    });

    it('should fallback to mock provider in production if iyzico is not configured', () => {
      jest.spyOn(configService, 'get').mockReturnValue('production');
      jest.spyOn(iyzicoProvider, 'isConfigured').mockReturnValue(false);

      const provider = service.getProvider();
      expect(provider).toBe(mockProvider);
    });
  });

  describe('getPaymentSettings', () => {
    it('should return client payment settings with supported card types and currency', () => {
      const settings = service.getPaymentSettings();

      expect(settings).toEqual({
        card_types: ['visa', 'mastercard', 'troy'],
        payment_types: ['credit_card', 'debit_card'],
        currency: 'TRY',
      });
    });
  });

  describe('charge', () => {
    it('should delegate charge to active provider and return success result', async () => {
      const chargeSpy = jest.spyOn(mockProvider, 'charge');
      const result = await service.charge(sampleChargeRequest);

      expect(chargeSpy).toHaveBeenCalledWith(sampleChargeRequest);
      expect(result.success).toBe(true);
      expect(result.last4).toBe('0008');
    });

    it('should catch unhandled provider exception and return failure result', async () => {
      jest
        .spyOn(mockProvider, 'charge')
        .mockRejectedValueOnce(new Error('Network error'));

      const result = await service.charge(sampleChargeRequest);

      expect(result.success).toBe(false);
      expect(result.rawStatus).toBe(PAYMENT_STATUS.FAILED);
      expect(result.errorCode).toBe('PAYMENT_PROCESSING_ERROR');
      expect(result.errorMessage).toBe('Network error');
    });

    it('should support explicit provider override in charge', async () => {
      const iyzicoResult: PaymentChargeResult = {
        success: true,
        provider: PAYMENT_PROVIDERS.IYZICO,
        providerRef: 'iyz_123',
        cardType: 'visa',
        last4: '1111',
        rawStatus: PAYMENT_STATUS.SUCCEEDED,
      };
      const chargeSpy = jest
        .spyOn(iyzicoProvider, 'charge')
        .mockResolvedValueOnce(iyzicoResult);

      const result = await service.charge(sampleChargeRequest, 'iyzico');

      expect(chargeSpy).toHaveBeenCalledWith(sampleChargeRequest);
      expect(result.provider).toBe(PAYMENT_PROVIDERS.IYZICO);
    });
  });

  describe('refund', () => {
    it('should delegate refund to active provider and return result', async () => {
      const refundSpy = jest.spyOn(mockProvider, 'refund');
      const result = await service.refund(sampleRefundRequest);

      expect(refundSpy).toHaveBeenCalledWith(sampleRefundRequest);
      expect(result.success).toBe(true);
      expect(result.rawStatus).toBe(PAYMENT_STATUS.REFUNDED);
    });

    it('should catch unhandled refund error and return failure result', async () => {
      jest
        .spyOn(mockProvider, 'refund')
        .mockRejectedValueOnce(new Error('Gateway error'));

      const result = await service.refund(sampleRefundRequest);

      expect(result.success).toBe(false);
      expect(result.rawStatus).toBe(PAYMENT_STATUS.FAILED);
      expect(result.errorMessage).toBe('Gateway error');
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should delegate signature verification to active provider', () => {
      const verifySpy = jest.spyOn(mockProvider, 'verifyWebhookSignature');
      const isValid = service.verifyWebhookSignature('payload', 'sig', '12345');

      expect(verifySpy).toHaveBeenCalledWith('payload', 'sig', '12345');
      expect(isValid).toBe(true);
    });
  });
});
