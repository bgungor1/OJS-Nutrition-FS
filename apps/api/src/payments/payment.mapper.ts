import { PaymentTransaction } from '@prisma/client';
import { PaymentTransactionResponse } from './interfaces/payment-transaction-response.interface';

/**
 * Prisma PaymentTransaction entity'sini frontend sözleşmesine (snake_case)
 * dönüştüren saf eşleyici fonksiyonlar — bkz. ENGINEERING_STANDARDS §1.
 */
export function toPaymentTransactionResponse(
  entity: PaymentTransaction,
): PaymentTransactionResponse {
  return {
    id: entity.id,
    order_id: entity.orderId,
    provider: entity.provider,
    provider_ref: entity.providerRef,
    card_type: entity.cardType,
    last4: entity.last4,
    status: entity.status,
    created_at: entity.createdAt.toISOString(),
  };
}

export function toPaymentTransactionResponseList(
  entities: PaymentTransaction[],
): PaymentTransactionResponse[] {
  return entities.map(toPaymentTransactionResponse);
}
