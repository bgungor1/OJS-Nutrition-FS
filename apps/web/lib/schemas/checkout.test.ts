import { describe, it, expect } from 'vitest';
import { checkoutPaymentSchema } from './checkout';

const VALID_CHECKOUT_PAYLOAD = {
  address_id: 'd3b07384-d113-469b-81d4-8d48695026ff',
  payment_type: 'credit_card' as const,
  card_holder: 'Ahmet Yılmaz',
  card_number: '4532 0151 1283 0366',
  expire_month: '12',
  expire_year: '28',
  cvv: '123',
  terms_accepted: true as const,
};

describe('checkoutPaymentSchema', () => {
  it('validates a complete and correct checkout payload', () => {
    const result = checkoutPaymentSchema.safeParse(VALID_CHECKOUT_PAYLOAD);
    expect(result.success).toBe(true);
  });

  it('accepts Turkish characters in card holder name and 4-digit years', () => {
    const payload = {
      ...VALID_CHECKOUT_PAYLOAD,
      card_holder: 'Ömer Faruk Çeliktaş',
      expire_year: '2028',
    };
    expect(checkoutPaymentSchema.safeParse(payload).success).toBe(true);
  });

  it('accepts 4-digit CVV (e.g. for American Express)', () => {
    const payload = {
      ...VALID_CHECKOUT_PAYLOAD,
      card_number: '3782 8224 6310 005',
      cvv: '1234',
    };
    expect(checkoutPaymentSchema.safeParse(payload).success).toBe(true);
  });

  it('fails when address_id is not a valid UUID', () => {
    const payload = {
      ...VALID_CHECKOUT_PAYLOAD,
      address_id: 'invalid-address-id',
    };
    const result = checkoutPaymentSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/geçerli bir teslimat adresi/i);
    }
  });

  it('fails when card_holder contains numbers or invalid symbols', () => {
    const payload = {
      ...VALID_CHECKOUT_PAYLOAD,
      card_holder: 'Ahmet Yilmaz 123!',
    };
    const result = checkoutPaymentSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/sadece harflerden/i);
    }
  });

  it('fails when card_holder is shorter than 3 characters', () => {
    const payload = {
      ...VALID_CHECKOUT_PAYLOAD,
      card_holder: 'Al',
    };
    const result = checkoutPaymentSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/en az 3 karakter/i);
    }
  });

  it('fails when card_number fails Luhn algorithm check', () => {
    const payload = {
      ...VALID_CHECKOUT_PAYLOAD,
      card_number: '4532 0151 1283 0367',
    };
    const result = checkoutPaymentSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/geçersiz kart numarası/i);
    }
  });

  it('fails when card_number length is less than 15 digits', () => {
    const payload = {
      ...VALID_CHECKOUT_PAYLOAD,
      card_number: '4532 0151 1283',
    };
    const result = checkoutPaymentSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/15 veya 16 haneli/i);
    }
  });

  it('fails when expire_month is outside 01-12 range', () => {
    const payload = {
      ...VALID_CHECKOUT_PAYLOAD,
      expire_month: '13',
    };
    const result = checkoutPaymentSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/01 ile 12 arasında/i);
    }
  });

  it('fails when card expiration date is in the past', () => {
    const payload = {
      ...VALID_CHECKOUT_PAYLOAD,
      expire_month: '01',
      expire_year: '23',
    };
    const result = checkoutPaymentSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/geçmiş olamaz/i);
    }
  });

  it('fails when cvv is not 3 or 4 digits', () => {
    const payload = {
      ...VALID_CHECKOUT_PAYLOAD,
      cvv: '12',
    };
    const result = checkoutPaymentSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/3 veya 4 haneli/i);
    }
  });

  it('fails when terms_accepted is false', () => {
    const payload = {
      ...VALID_CHECKOUT_PAYLOAD,
      terms_accepted: false,
    };
    const result = checkoutPaymentSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/onaylamalısınız/i);
    }
  });

  it('accepts official iyzico test card (5890 0400 0000 0016)', () => {
    const payload = {
      ...VALID_CHECKOUT_PAYLOAD,
      card_number: '5890 0400 0000 0016',
    };
    const result = checkoutPaymentSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('accepts optional card_holder_first_name and card_holder_last_name', () => {
    const payload = {
      ...VALID_CHECKOUT_PAYLOAD,
      card_holder: 'Ahmet Yılmaz',
      card_holder_first_name: 'Ahmet',
      card_holder_last_name: 'Yılmaz',
    };
    const result = checkoutPaymentSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('accepts custom test card ending with 1234 (4345 2901 0234 1234)', () => {
    const payload = {
      ...VALID_CHECKOUT_PAYLOAD,
      card_number: '4345 2901 0234 1234',
    };
    const result = checkoutPaymentSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });
});
