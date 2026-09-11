import type { ApiResponse } from '@/types';

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

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `API isteği başarısız oldu (${response.status})`;
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

  const json = (await response.json()) as ApiResponse<T>;

  if (json.status === 'error') {
    throw new ApiError(json.message || 'Bilinmeyen API hatası', response.status, json.reason);
  }

  return json.data;
}

export async function clientFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${CLIENT_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
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

  const json = (await response.json()) as ApiResponse<T>;

  if (json.status === 'error') {
    throw new ApiError(json.message || 'Bilinmeyen istemci hatası', response.status, json.reason);
  }

  return json.data;
}
