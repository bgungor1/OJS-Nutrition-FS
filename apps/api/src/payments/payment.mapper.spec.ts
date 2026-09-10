import { PaymentTransaction } from '@prisma/client';
import {
  toPaymentTransactionResponse,
  toPaymentTransactionResponseList,
} from './payment.mapper';

describe('PaymentMapper', () => {
  const mockEntity: PaymentTransaction = {
    id: 'pt-uuid-1',
    orderId: 'order-uuid-100',
    provider: 'iyzico',
    providerRef: '12345678',
    cardType: 'VISA',
    last4: '4242',
    status: 'succeeded',
    createdAt: new Date('2026-09-10T10:00:00.000Z'),
  };

  describe('toPaymentTransactionResponse', () => {
    it('should correctly map Prisma entity to snake_case API response contract', () => {
      const res = toPaymentTransactionResponse(mockEntity);

      expect(res).toEqual({
        id: 'pt-uuid-1',
        order_id: 'order-uuid-100',
        provider: 'iyzico',
        provider_ref: '12345678',
        card_type: 'VISA',
        last4: '4242',
        status: 'succeeded',
        created_at: '2026-09-10T10:00:00.000Z',
      });
    });
  });

  describe('toPaymentTransactionResponseList', () => {
    it('should return an empty array when given an empty list', () => {
      expect(toPaymentTransactionResponseList([])).toEqual([]);
    });

    it('should map multiple entities preserving order and properties', () => {
      const secondEntity: PaymentTransaction = {
        ...mockEntity,
        id: 'pt-uuid-2',
        providerRef: '87654321',
        cardType: 'MASTERCARD',
        last4: '5555',
      };

      const res = toPaymentTransactionResponseList([mockEntity, secondEntity]);

      expect(res).toHaveLength(2);
      expect(res[0].id).toBe('pt-uuid-1');
      expect(res[1].id).toBe('pt-uuid-2');
      expect(res[1].card_type).toBe('MASTERCARD');
      expect(res[1].last4).toBe('5555');
    });
  });
});
