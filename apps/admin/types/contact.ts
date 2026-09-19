export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  handled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactQuery {
  handled?: boolean;
  limit?: number;
  offset?: number;
}

export interface ContactListResponse {
  count: number;
  results: ContactMessage[];
}

export interface UpdateContactDto {
  handled: boolean;
}
