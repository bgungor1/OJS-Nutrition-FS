import { PAYMENT_PROVIDERS, PAYMENT_STATUS } from '../payment.constants';
import {
  PaymentChargeRequest,
  PaymentChargeResult,
  PaymentRefundRequest,
  PaymentRefundResult,
} from '../interfaces/payment-process.interface';

export interface IyzicoRawResponse {
  status?: string;
  paymentId?: string | number;
  paymentTransactionId?: string | number;
  conversationId?: string;
  cardType?: string;
  lastFourDigits?: string;
  errorCode?: string;
  errorMessage?: string;
}

export function buildIyzicoChargePayload(request: PaymentChargeRequest) {
  return {
    locale: 'tr',
    conversationId: request.orderNo,
    price: request.amount.toFixed(2),
    paidPrice: request.amount.toFixed(2),
    currency: request.currency || 'TRY',
    installment: '1',
    basketId: request.orderNo,
    paymentChannel: 'WEB',
    paymentGroup: 'PRODUCT',
    paymentCard: {
      paymentToken: request.paymentToken,
    },
    buyer: {
      id: request.buyer.id,
      name: request.buyer.name,
      surname: request.buyer.surname,
      gsmNumber: request.buyer.gsmNumber || '+905555555555',
      email: request.buyer.email,
      identityNumber: '11111111110',
      registrationAddress:
        request.buyer.registrationAddress || request.shippingAddress.address,
      city: request.buyer.city || request.shippingAddress.city,
      country: request.buyer.country || request.shippingAddress.country,
      ip: request.buyer.ip || '127.0.0.1',
    },
    shippingAddress: {
      contactName: request.shippingAddress.contactName,
      city: request.shippingAddress.city,
      country: request.shippingAddress.country,
      address: request.shippingAddress.address,
      zipCode: request.shippingAddress.zipCode || '34000',
    },
    billingAddress: {
      contactName: request.billingAddress.contactName,
      city: request.billingAddress.city,
      country: request.billingAddress.country,
      address: request.billingAddress.address,
      zipCode: request.billingAddress.zipCode || '34000',
    },
    basketItems: request.items.map((item) => ({
      id: item.id,
      name: item.name,
      category1: item.category,
      itemType: 'PHYSICAL',
      price: item.price.toFixed(2),
    })),
  };
}

export function mapIyzicoChargeResponse(
  data: IyzicoRawResponse,
  fallbackRef: string,
): PaymentChargeResult {
  if (data.status === 'success') {
    return {
      success: true,
      provider: PAYMENT_PROVIDERS.IYZICO,
      providerRef: String(data.paymentId || fallbackRef),
      cardType: data.cardType || 'VISA',
      last4: data.lastFourDigits || '0000',
      rawStatus: PAYMENT_STATUS.SUCCEEDED,
    };
  }

  return {
    success: false,
    provider: PAYMENT_PROVIDERS.IYZICO,
    providerRef: data.paymentId ? String(data.paymentId) : '',
    cardType: data.cardType || '',
    last4: data.lastFourDigits || '',
    rawStatus: PAYMENT_STATUS.FAILED,
    errorCode: data.errorCode || 'PAYMENT_FAILED',
    errorMessage: data.errorMessage || 'Payment processing failed.',
  };
}

export function buildIyzicoRefundPayload(request: PaymentRefundRequest) {
  return {
    locale: 'tr',
    conversationId: request.providerRef,
    paymentTransactionId: request.providerRef,
    price: request.amount.toFixed(2),
    currency: request.currency || 'TRY',
    ip: '127.0.0.1',
  };
}

export function mapIyzicoRefundResponse(
  data: IyzicoRawResponse,
  fallbackRef: string,
): PaymentRefundResult {
  if (data.status === 'success') {
    return {
      success: true,
      refundId: String(
        data.paymentId || data.paymentTransactionId || fallbackRef,
      ),
      rawStatus: PAYMENT_STATUS.REFUNDED,
    };
  }

  return {
    success: false,
    refundId: '',
    rawStatus: PAYMENT_STATUS.FAILED,
    errorMessage: data.errorMessage || 'Refund processing failed.',
  };
}
