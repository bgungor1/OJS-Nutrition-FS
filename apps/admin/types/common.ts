export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
  reason?: Record<string, string>;
  statusCode?: number;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  results: T[];
}

export interface SuccessIdResponse {
  id: string;
}
