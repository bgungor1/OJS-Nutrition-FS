import { describe, it, expect } from 'vitest';
import {
  addressSchema,
  addressToFormData,
  DEFAULT_ADDRESS_FORM,
  PHONE_NUMBER_REGEX,
} from './address';
import type { Address } from '@/types';

describe('address schema and utilities', () => {
  const validAddressInput = {
    title: 'Ev Adresim',
    first_name: 'Ahmet',
    last_name: 'Yılmaz',
    phone_number: '05551234567',
    country_id: 1,
    region_id: 34,
    subregion_id: 450,
    full_address: 'Barbaros Bulvarı No:123 Daire:4 Beşiktaş / İstanbul',
  };

  describe('addressSchema', () => {
    it('validates correct address input successfully', () => {
      const result = addressSchema.safeParse(validAddressInput);
      expect(result.success).toBe(true);
    });

    it('coerces string ids to integers', () => {
      const result = addressSchema.safeParse({
        ...validAddressInput,
        country_id: '1',
        region_id: '34',
        subregion_id: '450',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.country_id).toBe(1);
        expect(result.data.region_id).toBe(34);
        expect(result.data.subregion_id).toBe(450);
      }
    });

    it('fails when title is shorter than 2 characters', () => {
      const result = addressSchema.safeParse({ ...validAddressInput, title: 'E' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message === 'Adres başlığı en az 2 karakter olmalıdır.')).toBe(true);
      }
    });

    it('fails when full_address is shorter than 10 characters', () => {
      const result = addressSchema.safeParse({ ...validAddressInput, full_address: 'Kısa adr' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message === 'Açık adres en az 10 karakter olmalıdır.')).toBe(true);
      }
    });

    it('fails when phone number does not match phone regex', () => {
      const result = addressSchema.safeParse({ ...validAddressInput, phone_number: '123' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) =>
          i.message === 'Geçerli bir telefon numarası giriniz (örn: 05551234567).',
        )).toBe(true);
      }
    });

    it('fails when region_id or subregion_id is zero or empty', () => {
      const result = addressSchema.safeParse({ ...validAddressInput, region_id: 0, subregion_id: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes('region_id'))).toBe(true);
        expect(result.error.issues.some((i) => i.path.includes('subregion_id'))).toBe(true);
      }
    });
  });

  describe('PHONE_NUMBER_REGEX', () => {
    it('accepts valid phone number formats', () => {
      expect(PHONE_NUMBER_REGEX.test('05551234567')).toBe(true);
      expect(PHONE_NUMBER_REGEX.test('+90 555 123 45 67')).toBe(true);
      expect(PHONE_NUMBER_REGEX.test('(0555) 123-4567')).toBe(true);
    });

    it('rejects invalid or too short phone numbers', () => {
      expect(PHONE_NUMBER_REGEX.test('abc12345678')).toBe(false);
      expect(PHONE_NUMBER_REGEX.test('0555')).toBe(false);
    });
  });

  describe('addressToFormData', () => {
    it('returns default form data when address is null or undefined', () => {
      const resultWithCountry = addressToFormData(null, 1);
      const resultWithoutCountry = addressToFormData(null);

      expect(resultWithCountry).toEqual({
        ...DEFAULT_ADDRESS_FORM,
        country_id: 1,
      });
      expect(resultWithoutCountry.country_id).toBe('');
    });

    it('maps address object fields to form data properly', () => {
      const mockAddress: Address = {
        id: 'addr-123',
        title: 'İş Adresi',
        first_name: 'Mehmet',
        last_name: 'Demir',
        phone_number: '05321112233',
        country_id: 1,
        region_id: 6,
        subregion_id: 120,
        full_address: 'Kızılay Caddesi No:45 Çankaya / Ankara',
        created_at: '2026-01-01T00:00:00Z',
      };

      const formData = addressToFormData(mockAddress);

      expect(formData.title).toBe('İş Adresi');
      expect(formData.first_name).toBe('Mehmet');
      expect(formData.last_name).toBe('Demir');
      expect(formData.phone_number).toBe('05321112233');
      expect(formData.country_id).toBe(1);
      expect(formData.region_id).toBe(6);
      expect(formData.subregion_id).toBe(120);
      expect(formData.full_address).toBe('Kızılay Caddesi No:45 Çankaya / Ankara');
    });
  });
});
