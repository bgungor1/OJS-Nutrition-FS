import type { ApiResponse } from '@/types';
import { getAccessToken } from './auth-cookies';

export class ApiError extends Error {
  status: number;
  reason?: Record<string, string>;

  constructor(message: string, status = 500, reason?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.reason = reason;
  }
}

const SERVER_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';
const CLIENT_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

export async function serverFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${SERVER_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options?.headers);
  const isFormData = typeof FormData !== 'undefined' && options?.body instanceof FormData;

  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!headers.has('Authorization')) {
    try {
      const token = await getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    } catch {
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Yönetici API isteği başarısız oldu (${response.status})`;
    let reason: Record<string, string> | undefined;

    try {
      const errorJson = (await response.json()) as ApiResponse<unknown>;
      if (errorJson.status === 'error') {
        errorMessage = errorJson.message || errorMessage;
        reason = errorJson.reason;
      }
    } catch {
    }

    throw new ApiError(errorMessage, response.status, reason);
  }
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const json = (await response.json()) as ApiResponse<T>;

  if (json.status === 'error') {
    throw new ApiError(
      json.message || 'Bilinmeyen API hatası',
      response.status,
      json.reason,
    );
  }

  return json.data;
}

export async function clientFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${CLIENT_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options?.headers);
  const isFormData = typeof FormData !== 'undefined' && options?.body instanceof FormData;

  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `İstemci isteği başarısız oldu (${response.status})`;
    let reason: Record<string, string> | undefined;

    try {
      const errorJson = (await response.json()) as ApiResponse<unknown>;
      if (errorJson.status === 'error') {
        errorMessage = errorJson.message || errorMessage;
        reason = errorJson.reason;
      }
    } catch {
    }

    throw new ApiError(errorMessage, response.status, reason);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const json = (await response.json()) as ApiResponse<T>;

  if (json.status === 'error') {
    throw new ApiError(
      json.message || 'Bilinmeyen istemci hatası',
      response.status,
      json.reason,
    );
  }

  return json.data;
}
