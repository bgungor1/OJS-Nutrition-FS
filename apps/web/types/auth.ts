export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface TokensResponse {
  access: string;
  refresh: string;
}

export interface SafeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt?: string | Date;
}

export interface RegisterResponse {
  user: SafeUser;
  message: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user?: SafeUser;
}
