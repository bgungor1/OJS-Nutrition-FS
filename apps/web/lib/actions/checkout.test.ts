import { describe, it, expect, vi, beforeEach } from 'vitest';
import { completeCheckoutAction } from './checkout';
import { getAccessToken } from '@/lib/auth-cookies';
import { completeShopping } from '@/lib/api/orders';
import { ApiError } from '@/lib/api-client';
import type { CheckoutFormData } from '@/lib/schemas/checkout';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/auth-cookies', () => ({
  getAccessToken: vi.fn(),
}));

vi.mock('@/lib/api/orders', () => ({
  completeShopping: vi.fn(),
}));

const validForm: CheckoutFormData = {
  address_id: 'd3b07384-d113-469b-81d4-8d48695026ff',
  payment_type: 'credit_card',
  card_holder: 'Ahmet Yılmaz',
  card_number: '4532 0151 1283 0366',
  expire_month: '12',
  expire_year: '28',
  cvv: '123',
  terms_accepted: true,
};

describe('completeCheckoutAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when user is not authenticated', async () => {
    vi.mocked(getAccessToken).mockResolvedValue(undefined);

    const result = await completeCheckoutAction(validForm);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/oturum süreniz dolmuş/i);
    expect(completeShopping).not.toHaveBeenCalled();
  });

  it('returns field errors when validation fails', async () => {
    vi.mocked(getAccessToken).mockResolvedValue('mock_token');

    const invalidForm = {
      ...validForm,
      card_number: '1234',
    };

    const result = await completeCheckoutAction(invalidForm);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/hataları düzeltiniz/i);
    expect(result.fieldErrors?.card_number).toBeDefined();
    expect(completeShopping).not.toHaveBeenCalled();
  });

  it('successfully creates order and returns order details', async () => {
    vi.mocked(getAccessToken).mockResolvedValue('mock_token');
    vi.mocked(completeShopping).mockResolvedValue({
      id: 'order_123',
      order_no: 'ORD-2026-0001',
      status: 'pending',
      total_price: 549,
      shipping_fee: 0,
      subtotal: 549,
      address_snapshot: {} as never,
      items: [],
      created_at: '2026-09-14T12:00:00Z',
    });

    const result = await completeCheckoutAction(validForm);

    expect(result.success).toBe(true);
    expect(result.orderId).toBe('order_123');
    expect(result.orderNo).toBe('ORD-2026-0001');
    expect(completeShopping).toHaveBeenCalledWith(
      'mock_token',
      expect.objectContaining({
        address_id: validForm.address_id,
        payment_type: 'credit_card',
        payment_token: expect.stringContaining('tok_sandbox_'),
      }),
    );
  });

  it('handles ApiError correctly and returns server error message', async () => {
    vi.mocked(getAccessToken).mockResolvedValue('mock_token');
    vi.mocked(completeShopping).mockRejectedValue(
      new ApiError('Kart limiti yetersiz.', 400),
    );

    const result = await completeCheckoutAction(validForm);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Kart limiti yetersiz.');
  });

  it('handles unexpected generic error gracefully', async () => {
    vi.mocked(getAccessToken).mockResolvedValue('mock_token');
    vi.mocked(completeShopping).mockRejectedValue(new Error('Network crash'));

    const result = await completeCheckoutAction(validForm);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/beklenmeyen bir hata/i);
  });
});
