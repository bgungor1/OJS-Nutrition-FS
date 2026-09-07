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

export interface GoogleProfile {
  googleId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}
