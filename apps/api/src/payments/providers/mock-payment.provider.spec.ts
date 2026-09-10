import { GatewayTimeoutException } from '@nestjs/common';
import {
  MockPaymentProvider,
  MOCK_VALID_WEBHOOK_SIGNATURE,
} from './mock-payment.provider';
import { PaymentChargeRequest } from '../interfaces/payment-process.interface';

describe('MockPaymentProvider', () => {
  let provider: MockPaymentProvider;

  const baseChargeRequest: PaymentChargeRequest = {
    paymentToken: 'tok_default',
    amount: 150.0,
    currency: 'TRY',
    orderNo: 'ORD-2026-0001',
    buyer: {
      id: 'usr-1',
      name: 'Ali',
      surname: 'Kaya',
      email: 'ali@example.com',
    },
    shippingAddress: {
      contactName: 'Ali Kaya',
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Kadikoy Bagdat Cad. No:1',
    },
    billingAddress: {
      contactName: 'Ali Kaya',
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Kadikoy Bagdat Cad. No:1',
    },
    items: [
      {
        id: 'var-1',
        name: 'Whey Protein Cikolata',
        category: 'Protein',
        price: 150.0,
      },
    ],
  };

  beforeEach(() => {
    provider = new MockPaymentProvider();
  });

  describe('charge', () => {
    it('should successfully charge payment with default token', async () => {
      const result = await provider.charge(baseChargeRequest);

      expect(result.success).toBe(true);
      expect(result.provider).toBe('mock');
      expect(result.providerRef).toMatch(/^mock_pay_/);
      expect(result.cardType).toBe('VISA');
      expect(result.last4).toBe('4242');
      expect(result.rawStatus).toBe('succeeded');
    });

    it('should successfully charge payment with tok_success token', async () => {
      const result = await provider.charge({
        ...baseChargeRequest,
        paymentToken: 'tok_success_xyz',
      });

      expect(result.success).toBe(true);
      expect(result.rawStatus).toBe('succeeded');
    });

    it('should return failure result with CARD_DECLINED when token is tok_fail_declined', async () => {
      const result = await provider.charge({
        ...baseChargeRequest,
        paymentToken: 'tok_fail_declined',
      });

      expect(result.success).toBe(false);
      expect(result.rawStatus).toBe('failed');
      expect(result.errorCode).toBe('CARD_DECLINED');
      expect(result.errorMessage).toBe('The card was declined by the bank.');
      expect(result.providerRef).toMatch(/^mock_declined_/);
    });

    it('should return failure result with INSUFFICIENT_FUNDS when token is tok_fail_insufficient', async () => {
      const result = await provider.charge({
        ...baseChargeRequest,
        paymentToken: 'tok_fail_insufficient',
      });

      expect(result.success).toBe(false);
      expect(result.rawStatus).toBe('failed');
      expect(result.errorCode).toBe('INSUFFICIENT_FUNDS');
      expect(result.errorMessage).toBe('Insufficient funds on the card.');
      expect(result.providerRef).toMatch(/^mock_insufficient_/);
    });

    it('should throw GatewayTimeoutException when token is tok_fail_timeout', async () => {
      await expect(
        provider.charge({
          ...baseChargeRequest,
          paymentToken: 'tok_fail_timeout',
        }),
      ).rejects.toThrow(GatewayTimeoutException);
    });
  });

  describe('refund', () => {
    it('should successfully process refund for a valid transaction reference', async () => {
      const result = await provider.refund({
        providerRef: 'mock_pay_12345',
        amount: 150.0,
      });

      expect(result.success).toBe(true);
      expect(result.refundId).toMatch(/^mock_ref_/);
      expect(result.rawStatus).toBe('refunded');
    });

    it('should return failed result when providerRef starts with mock_fail', async () => {
      const result = await provider.refund({
        providerRef: 'mock_fail_transaction',
        amount: 150.0,
      });

      expect(result.success).toBe(false);
      expect(result.rawStatus).toBe('failed');
      expect(result.errorMessage).toBe(
        'The refund operation was rejected by the provider.',
      );
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should return true for valid mock signature', () => {
      const isValid = provider.verifyWebhookSignature(
        '{"status":"SUCCESS"}',
        MOCK_VALID_WEBHOOK_SIGNATURE,
      );

      expect(isValid).toBe(true);
    });

    it('should return false for invalid mock signature', () => {
      const isValid = provider.verifyWebhookSignature(
        '{"status":"SUCCESS"}',
        'invalid_signature',
      );

      expect(isValid).toBe(false);
    });

    it('should return false when signature or payload is empty', () => {
      expect(
        provider.verifyWebhookSignature('', MOCK_VALID_WEBHOOK_SIGNATURE),
      ).toBe(false);
      expect(provider.verifyWebhookSignature('{"status":"SUCCESS"}', '')).toBe(
        false,
      );
    });
  });
});
