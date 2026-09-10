import { ConfigService } from '@nestjs/config';
import { IyzicoPaymentProvider } from './iyzico-payment.provider';
import { PaymentChargeRequest } from '../interfaces/payment-process.interface';
import { createHmac } from 'crypto';

describe('IyzicoPaymentProvider', () => {
  let provider: IyzicoPaymentProvider;
  let mockConfigService: jest.Mocked<ConfigService>;
  const originalFetch = global.fetch;

  const baseChargeRequest: PaymentChargeRequest = {
    paymentToken: 'tok_live_123',
    amount: 250.0,
    currency: 'TRY',
    orderNo: 'ORD-2026-999',
    buyer: {
      id: 'usr-2',
      name: 'Zeynep',
      surname: 'Demir',
      email: 'zeynep@example.com',
    },
    shippingAddress: {
      contactName: 'Zeynep Demir',
      city: 'Ankara',
      country: 'Turkey',
      address: 'Cankaya Tunali Hilmi Cad. No:10',
    },
    billingAddress: {
      contactName: 'Zeynep Demir',
      city: 'Ankara',
      country: 'Turkey',
      address: 'Cankaya Tunali Hilmi Cad. No:10',
    },
    items: [
      {
        id: 'var-10',
        name: 'Kreatin Monohidrat',
        category: 'Kreatin',
        price: 250.0,
      },
    ],
  };

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'iyzico.apiKey') return 'test-api-key';
        if (key === 'iyzico.secretKey') return 'test-secret-key';
        if (key === 'iyzico.baseUrl') return 'https://sandbox-api.iyzipay.com';
        return undefined;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    provider = new IyzicoPaymentProvider(mockConfigService);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  describe('charge', () => {
    it('should return failure with CONFIG_ERROR if apiKey or secretKey is missing', async () => {
      mockConfigService.get.mockReturnValue(undefined);
      const unconfiguredProvider = new IyzicoPaymentProvider(mockConfigService);

      const result = await unconfiguredProvider.charge(baseChargeRequest);

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('CONFIG_ERROR');
      expect(result.errorMessage).toBe(
        'iyzico credentials are not configured.',
      );
    });

    it('should return successful result when iyzico responds with status success', async () => {
      const mockResponse = {
        status: 'success',
        paymentId: '100200300',
        cardType: 'MASTERCARD',
        lastFourDigits: '5555',
      };

      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await provider.charge(baseChargeRequest);

      expect(result.success).toBe(true);
      expect(result.provider).toBe('iyzico');
      expect(result.providerRef).toBe('100200300');
      expect(result.cardType).toBe('MASTERCARD');
      expect(result.last4).toBe('5555');
      expect(result.rawStatus).toBe('succeeded');
    });

    it('should return failure result when iyzico responds with status failure', async () => {
      const mockResponse = {
        status: 'failure',
        paymentId: '100200301',
        errorCode: '5051',
        errorMessage: 'Kart limiti yetersiz.',
      };

      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await provider.charge(baseChargeRequest);

      expect(result.success).toBe(false);
      expect(result.provider).toBe('iyzico');
      expect(result.errorCode).toBe('5051');
      expect(result.errorMessage).toBe('Kart limiti yetersiz.');
      expect(result.rawStatus).toBe('failed');
    });

    it('should return failure with GATEWAY_ERROR on network or fetch failure', async () => {
      global.fetch = jest
        .fn()
        .mockRejectedValue(new Error('Connection timed out'));

      const result = await provider.charge(baseChargeRequest);

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('GATEWAY_ERROR');
      expect(result.errorMessage).toBe('Connection timed out');
      expect(result.rawStatus).toBe('failed');
    });
  });

  describe('refund', () => {
    it('should return failure if API keys are missing', async () => {
      mockConfigService.get.mockReturnValue(undefined);
      const unconfiguredProvider = new IyzicoPaymentProvider(mockConfigService);

      const result = await unconfiguredProvider.refund({
        providerRef: '100200300',
        amount: 250.0,
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe(
        'iyzico credentials are not configured.',
      );
    });

    it('should return successful refund when iyzico responds with status success', async () => {
      const mockResponse = {
        status: 'success',
        paymentTransactionId: 'ref-999',
      };

      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await provider.refund({
        providerRef: '100200300',
        amount: 250.0,
      });

      expect(result.success).toBe(true);
      expect(result.refundId).toBe('ref-999');
      expect(result.rawStatus).toBe('refunded');
    });

    it('should return failure when iyzico refund call fails', async () => {
      const mockResponse = {
        status: 'failure',
        errorMessage: 'İptal edilemez durumdaki işlem.',
      };

      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await provider.refund({
        providerRef: '100200300',
        amount: 250.0,
      });

      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('İptal edilemez durumdaki işlem.');
      expect(result.rawStatus).toBe('failed');
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should return true for valid webhook signature matching secretKey', () => {
      const payload = '{"status":"SUCCESS"}';
      const validSignature = createHmac('sha256', 'test-secret-key')
        .update(payload)
        .digest('hex');

      const isValid = provider.verifyWebhookSignature(payload, validSignature);

      expect(isValid).toBe(true);
    });

    it('should return false for invalid webhook signature', () => {
      const isValid = provider.verifyWebhookSignature(
        '{"status":"SUCCESS"}',
        'invalid_signature',
      );

      expect(isValid).toBe(false);
    });
  });
});
