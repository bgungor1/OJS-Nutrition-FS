export interface LocationReference {
  id: number;
  name: string;
}

export interface Address {
  id: string;
  title: string;
  first_name: string;
  last_name: string;
  country_id: number;
  country?: LocationReference;
  region_id: number;
  region?: LocationReference;
  subregion_id: number;
  subregion?: LocationReference;
  full_address: string;
  phone_number: string;
  created_at?: string;
}

export interface CreateAddressRequest {
  title: string;
  first_name: string;
  last_name: string;
  country_id: number;
  region_id: number;
  subregion_id: number;
  full_address: string;
  phone_number: string;
}

export interface UpdateAddressRequest {
  title?: string;
  first_name?: string;
  last_name?: string;
  country_id?: number;
  region_id?: number;
  subregion_id?: number;
  full_address?: string;
  phone_number?: string;
}

export interface PaginatedAddressesResponse {
  count: number;
  results: Address[];
}

export interface DeleteAddressResponse {
  id: string;
}
