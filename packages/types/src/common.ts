export interface ApiSuccessResponse<T> {
  status: 'success';
  data: T;
  statusCode?: number;
  timestamp?: string;
}

export interface ApiErrorResponse {
  status: 'error';
  message?: string;
  reason?: Record<string, string>;
  statusCode?: number;
  timestamp?: string;
}

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
  next?: string | null;
  previous?: string | null;
  results: T[];
}

export interface SuccessIdResponse {
  id: string;
}

export interface ApiPriceInfo {
  profit: number | null;
  total_price: number;
  discounted_price: number | null;
  price_per_servings: number | null;
  discount_percentage: number | null;
}
