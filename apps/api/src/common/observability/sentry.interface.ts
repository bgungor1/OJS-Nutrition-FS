export interface SentryApiContext {
  correlationId?: string;
  method?: string;
  url?: string;
  userId?: string;
  extra?: Record<string, unknown>;
  tags?: Record<string, string>;
}

export interface SentryBreadcrumb {
  category: string;
  message: string;
  data?: Record<string, unknown>;
  level?: 'info' | 'warn' | 'error';
  timestamp?: number;
}

export interface SentrySpan {
  id?: string;
  op: string;
  description?: string;
  durationMs: number;
  status?: string;
  data?: Record<string, unknown>;
  tags?: Record<string, string>;
  timestamp?: number;
}

export interface SlowQueryMetric {
  query: string;
  duration: number;
  params?: unknown;
  target?: string;
}

export interface SlowRequestMetric {
  method: string;
  url: string;
  duration: number;
  statusCode: number;
  correlationId?: string;
}

export interface PerformanceMetricsSummary {
  totalSpans: number;
  totalRequests: number;
  slowRequests: number;
  slowQueries: number;
  averageDurationMs: number;
  p95DurationMs: number;
  p99DurationMs: number;
}
