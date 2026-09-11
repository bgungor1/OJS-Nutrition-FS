import { z } from 'zod';
import type { Address } from '@/types';

export const PHONE_NUMBER_REGEX = /^[+0-9\s()-]{10,20}$/;

export const addressSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Adres başlığı en az 2 karakter olmalıdır.')
    .max(50, 'Adres başlığı en fazla 50 karakter olabilir.'),
  first_name: z
    .string()
    .trim()
    .min(2, 'Alıcı adı en az 2 karakter olmalıdır.')
    .max(50, 'Alıcı adı en fazla 50 karakter olabilir.'),
  last_name: z
    .string()
    .trim()
    .min(2, 'Alıcı soyadı en az 2 karakter olmalıdır.')
    .max(50, 'Alıcı soyadı en fazla 50 karakter olabilir.'),
  country_id: z.coerce
    .number({ invalid_type_error: 'Lütfen bir ülke seçiniz.' })
    .int()
    .min(1, 'Lütfen bir ülke seçiniz.'),
  region_id: z.coerce
    .number({ invalid_type_error: 'Lütfen bir il seçiniz.' })
    .int()
    .min(1, 'Lütfen bir il seçiniz.'),
  subregion_id: z.coerce
    .number({ invalid_type_error: 'Lütfen bir ilçe seçiniz.' })
    .int()
    .min(1, 'Lütfen bir ilçe seçiniz.'),
  full_address: z
    .string()
    .trim()
    .min(10, 'Açık adres en az 10 karakter olmalıdır.')
    .max(255, 'Açık adres en fazla 255 karakter olabilir.'),
  phone_number: z
    .string()
    .trim()
    .regex(PHONE_NUMBER_REGEX, 'Geçerli bir telefon numarası giriniz (örn: 05551234567).'),
});

export type AddressInput = z.infer<typeof addressSchema>;

export interface AddressFormData {
  title: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  country_id: number | '';
  region_id: number | '';
  subregion_id: number | '';
  full_address: string;
}

export const DEFAULT_ADDRESS_FORM: AddressFormData = {
  title: '',
  first_name: '',
  last_name: '',
  phone_number: '',
  country_id: '',
  region_id: '',
  subregion_id: '',
  full_address: '',
};

export function addressToFormData(
  address?: Address | null,
  defaultCountryId?: number,
): AddressFormData {
  if (!address) {
    return { ...DEFAULT_ADDRESS_FORM, country_id: defaultCountryId ?? '' };
  }
  return {
    title: address.title,
    first_name: address.first_name,
    last_name: address.last_name,
    phone_number: address.phone_number,
    country_id: address.country_id,
    region_id: address.region_id,
    subregion_id: address.subregion_id,
    full_address: address.full_address,
  };
}
