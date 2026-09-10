export const SUPPORTED_CARD_TYPES = ['visa', 'mastercard', 'troy'] as const;
export type SupportedCardType = (typeof SUPPORTED_CARD_TYPES)[number];

export const SUPPORTED_PAYMENT_TYPES = ['credit_card', 'debit_card'] as const;
export type SupportedPaymentType = (typeof SUPPORTED_PAYMENT_TYPES)[number];

export const DEFAULT_CURRENCY = 'TRY' as const;

export const PAYMENT_PROVIDERS = {
  IYZICO: 'iyzico',
  MOCK: 'mock',
} as const;
export type PaymentProviderName =
  (typeof PAYMENT_PROVIDERS)[keyof typeof PAYMENT_PROVIDERS];

export const PAYMENT_STATUS = {
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;
export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const WEBHOOK_TIMESTAMP_TOLERANCE_MS = 300_000;

export const IYZICO_AUTH_HEADER_PREFIX = 'IYZWS';
