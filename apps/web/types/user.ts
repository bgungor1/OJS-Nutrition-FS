export interface AccountProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}
