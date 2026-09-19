export type Role = 'customer' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: Role;
  createdAt: string;
  authProvider?: string;
}

export interface TokensResponse {
  access: string;
  refresh: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}
