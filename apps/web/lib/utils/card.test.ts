import { describe, it, expect } from 'vitest';
import {
  validateLuhn,
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  isCardExpired,
} from './card';

describe('validateLuhn', () => {
  it('returns true for valid card numbers according to Luhn checksum', () => {
    expect(validateLuhn('4532015112830366')).toBe(true);
    expect(validateLuhn('4532 0151 1283 0366')).toBe(true);
    expect(validateLuhn('5425233430109903')).toBe(true);
    expect(validateLuhn('378282246310005')).toBe(true);
  });

  it('returns false for invalid card numbers', () => {
    expect(validateLuhn('4532015112830367')).toBe(false);
    expect(validateLuhn('4111111111111112')).toBe(false);
    expect(validateLuhn('0000000000000000')).toBe(false);
  });

  it('returns false for too short or too long card numbers', () => {
    expect(validateLuhn('123456')).toBe(false);
    expect(validateLuhn('123456789012345678901')).toBe(false);
    expect(validateLuhn('')).toBe(false);
  });
});

describe('detectCardBrand', () => {
  it('detects Visa cards starting with 4', () => {
    expect(detectCardBrand('4543 1234 5678 9012')).toBe('visa');
    expect(detectCardBrand('4000000000000000')).toBe('visa');
  });

  it('detects Mastercard cards starting with 51-55 or 22-27', () => {
    expect(detectCardBrand('5425 2334 3010 9903')).toBe('mastercard');
    expect(detectCardBrand('2221 0000 0000 0000')).toBe('mastercard');
    expect(detectCardBrand('2720 9999 9999 9999')).toBe('mastercard');
  });

  it('detects Troy cards starting with 9792', () => {
    expect(detectCardBrand('9792 1234 5678 9012')).toBe('troy');
  });

  it('detects American Express cards starting with 34 or 37', () => {
    expect(detectCardBrand('3412 3456 7890 123')).toBe('amex');
    expect(detectCardBrand('3782 8224 6310 005')).toBe('amex');
  });

  it('returns unknown for unrecognized prefixes', () => {
    expect(detectCardBrand('6011 0000 0000 0000')).toBe('unknown');
    expect(detectCardBrand('')).toBe('unknown');
  });
});

describe('formatCardNumber', () => {
  it('formats digits into space-separated 4-digit chunks up to 16 digits', () => {
    expect(formatCardNumber('4543123456789012')).toBe('4543 1234 5678 9012');
    expect(formatCardNumber('4543123')).toBe('4543 123');
    expect(formatCardNumber('')).toBe('');
  });

  it('strips non-digit characters during formatting', () => {
    expect(formatCardNumber('4543-abcd-1234')).toBe('4543 1234');
  });
});

describe('formatExpiry', () => {
  it('formats digits into MM/YY format', () => {
    expect(formatExpiry('1228')).toBe('12/28');
    expect(formatExpiry('052')).toBe('05/2');
    expect(formatExpiry('12')).toBe('12');
  });
});

describe('isCardExpired', () => {
  const refDate = new Date('2026-09-15T12:00:00Z');

  it('returns false for current or future expiry dates', () => {
    expect(isCardExpired('09', '2026', refDate)).toBe(false);
    expect(isCardExpired('09', '26', refDate)).toBe(false);
    expect(isCardExpired('10', '2026', refDate)).toBe(false);
    expect(isCardExpired('01', '2027', refDate)).toBe(false);
    expect(isCardExpired('12', '30', refDate)).toBe(false);
  });

  it('returns true for past expiry dates', () => {
    expect(isCardExpired('08', '2026', refDate)).toBe(true);
    expect(isCardExpired('08', '26', refDate)).toBe(true);
    expect(isCardExpired('12', '2025', refDate)).toBe(true);
    expect(isCardExpired('01', '24', refDate)).toBe(true);
  });

  it('returns true for invalid months or years', () => {
    expect(isCardExpired('13', '2027', refDate)).toBe(true);
    expect(isCardExpired('00', '2027', refDate)).toBe(true);
    expect(isCardExpired('abc', '2027', refDate)).toBe(true);
  });
});
