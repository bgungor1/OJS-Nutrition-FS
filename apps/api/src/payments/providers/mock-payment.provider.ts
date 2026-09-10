import { GatewayTimeoutException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  PAYMENT_PROVIDERS,
  PAYMENT_STATUS,
  PaymentProviderName,
} from '../payment.constants';
import {
  PaymentChargeRequest,
  PaymentChargeResult,
  PaymentRefundRequest,
  PaymentRefundResult,
} from '../interfaces/payment-process.interface';
import { IPaymentProvider } from '../interfaces/payment-provider.interface';

export const MOCK_VALID_WEBHOOK_SIGNATURE = 'valid_mock_signature';

@Injectable()
export class MockPaymentProvider implements IPaymentProvider {
  readonly providerName: PaymentProviderName = PAYMENT_PROVIDERS.MOCK;

  charge(request: PaymentChargeRequest): Promise<PaymentChargeResult> {
    const token = request.paymentToken;

    if (token === 'tok_fail_timeout') {
      return Promise.reject(
        new GatewayTimeoutException('Payment gateway timed out (Simulated).'),
      );
    }

    if (token === 'tok_fail_declined') {
      return Promise.resolve({
        success: false,
        provider: this.providerName,
        providerRef: `mock_declined_${randomUUID()}`,
        cardType: 'VISA',
        last4: '4242',
        rawStatus: PAYMENT_STATUS.FAILED,
        errorCode: 'CARD_DECLINED',
        errorMessage: 'The card was declined by the bank.',
      });
    }

    if (token === 'tok_fail_insufficient') {
      return Promise.resolve({
        success: false,
        provider: this.providerName,
        providerRef: `mock_insufficient_${randomUUID()}`,
        cardType: 'VISA',
        last4: '4242',
        rawStatus: PAYMENT_STATUS.FAILED,
        errorCode: 'INSUFFICIENT_FUNDS',
        errorMessage: 'Insufficient funds on the card.',
      });
    }

    return Promise.resolve({
      success: true,
      provider: this.providerName,
      providerRef: `mock_pay_${randomUUID()}`,
      cardType: 'VISA',
      last4: '4242',
      rawStatus: PAYMENT_STATUS.SUCCEEDED,
    });
  }

  refund(request: PaymentRefundRequest): Promise<PaymentRefundResult> {
    if (request.providerRef.startsWith('mock_fail')) {
      return Promise.resolve({
        success: false,
        refundId: `mock_ref_failed_${randomUUID()}`,
        rawStatus: PAYMENT_STATUS.FAILED,
        errorMessage: 'The refund operation was rejected by the provider.',
      });
    }

    return Promise.resolve({
      success: true,
      refundId: `mock_ref_${randomUUID()}`,
      rawStatus: PAYMENT_STATUS.REFUNDED,
    });
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!signature || !payload) {
      return false;
    }
    return signature === MOCK_VALID_WEBHOOK_SIGNATURE;
  }
}
