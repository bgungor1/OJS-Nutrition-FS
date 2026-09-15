export interface ContactSubmitResponse {
  id: string;
  message: string;
}

export interface ContactMessageResponse {
  id: string;
  name: string;
  email: string;
  message: string;
  handled: boolean;
  created_at: string;
}

export interface ContactListResponse {
  count: number;
  results: ContactMessageResponse[];
}
