export interface SafeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: Date;
}

export interface RegisterResponse {
  user: SafeUser;
  message: string;
}

export interface TokensResponse {
  access: string;
  refresh: string;
}
