import { PaymentProviderName } from '../payment.constants';
import {
  PaymentChargeRequest,
  PaymentChargeResult,
  PaymentRefundRequest,
  PaymentRefundResult,
} from './payment-process.interface';

export interface IPaymentProvider {
  readonly providerName: PaymentProviderName;
  charge(request: PaymentChargeRequest): Promise<PaymentChargeResult>;
  refund(request: PaymentRefundRequest): Promise<PaymentRefundResult>;
  verifyWebhookSignature(
    payload: string,
    signature: string,
    timestamp?: string,
  ): boolean;
}
