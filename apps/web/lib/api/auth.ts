import { serverFetch } from '../api-client';
import type {
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  TokensResponse,
} from '@/types';

export async function loginApi(dto: LoginRequest): Promise<TokensResponse> {
  return serverFetch<TokensResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(dto),
    cache: 'no-store',
  });
}

export async function registerApi(dto: RegisterRequest): Promise<RegisterResponse> {
  return serverFetch<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(dto),
    cache: 'no-store',
  });
}

export async function refreshTokenApi(refresh: string): Promise<TokensResponse> {
  return serverFetch<TokensResponse>('/auth/token/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh }),
    cache: 'no-store',
  });
}
