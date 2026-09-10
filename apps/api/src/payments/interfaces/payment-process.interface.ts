import {
  PaymentProviderName,
  PaymentStatus,
  SupportedCardType,
  SupportedPaymentType,
} from '../payment.constants';

export interface PaymentBuyerInfo {
  id: string;
  name: string;
  surname: string;
  email: string;
  gsmNumber?: string;
  registrationAddress?: string;
  city?: string;
  country?: string;
  ip?: string;
}

export interface PaymentAddressInfo {
  contactName: string;
  city: string;
  country: string;
  address: string;
  zipCode?: string;
}

export interface PaymentItemInfo {
  id: string;
  name: string;
  category: string;
  price: number;
  subMerchantKey?: string;
}

export interface PaymentChargeRequest {
  paymentToken: string;
  amount: number;
  currency: string;
  orderNo: string;
  buyer: PaymentBuyerInfo;
  shippingAddress: PaymentAddressInfo;
  billingAddress: PaymentAddressInfo;
  items: PaymentItemInfo[];
  paymentType?: SupportedPaymentType;
}

export interface PaymentChargeResult {
  success: boolean;
  provider: PaymentProviderName;
  providerRef: string;
  cardType: string;
  last4: string;
  rawStatus: PaymentStatus;
  errorCode?: string;
  errorMessage?: string;
}

export interface PaymentRefundRequest {
  providerRef: string;
  amount: number;
  currency?: string;
  reason?: string;
}

export interface PaymentRefundResult {
  success: boolean;
  refundId: string;
  rawStatus: PaymentStatus;
  errorMessage?: string;
}

export interface PaymentSettingsResponse {
  card_types: SupportedCardType[];
  payment_types: SupportedPaymentType[];
  currency: string;
}
