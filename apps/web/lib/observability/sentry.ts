export interface SentryBreadcrumb {
  category: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp?: number;
}

export interface SentryUserContext {
  id?: string;
  email?: string;
  role?: string;
}

export interface SentryErrorContext {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  fingerprint?: string[];
  user?: SentryUserContext;
}

let currentUser: SentryUserContext | null = null;
const breadcrumbs: SentryBreadcrumb[] = [];
const MAX_BREADCRUMBS = 25;

export function isSentryEnabled(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  );
}

export function sanitizeErrorContext(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  const sensitiveKeys = [
    'password',
    'passwordhash',
    'token',
    'accesstoken',
    'refreshtoken',
    'cardnumber',
    'cvv',
    'secret',
  ];

  for (const [key, value] of Object.entries(data)) {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeErrorContext(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export function setSentryUser(user: SentryUserContext | null): void {
  currentUser = user;
}

export function getSentryUser(): SentryUserContext | null {
  return currentUser;
}

export function addBreadcrumb(breadcrumb: SentryBreadcrumb): void {
  breadcrumbs.push({
    ...breadcrumb,
    timestamp: breadcrumb.timestamp || Date.now(),
  });
  if (breadcrumbs.length > MAX_BREADCRUMBS) {
    breadcrumbs.shift();
  }
}

export function getBreadcrumbs(): readonly SentryBreadcrumb[] {
  return breadcrumbs;
}

export function clearBreadcrumbs(): void {
  breadcrumbs.length = 0;
}

export function captureException(
  error: unknown,
  context?: SentryErrorContext,
): string {
  const eventId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const errorMessage =
    error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  const sanitizedExtra = context?.extra
    ? sanitizeErrorContext(context.extra)
    : undefined;

  const payload = {
    eventId,
    message: errorMessage,
    stack: errorStack,
    user: context?.user || currentUser || undefined,
    tags: context?.tags,
    extra: sanitizedExtra,
    breadcrumbs: [...breadcrumbs],
    timestamp: new Date().toISOString(),
  };

  if (isSentryEnabled()) {
    // Üretim ortamında Sentry DSN konfigüre edildiğinde burası tetiklenir
    console.warn('[Sentry:Production] Exception captured:', payload);
  } else {
    // Yerel geliştirme ve CI ortamında güvenli tanı logu
    console.debug('[Sentry:Local] Exception captured:', payload);
  }

  return eventId;
}

export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: SentryErrorContext,
): string {
  const eventId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const payload = {
    eventId,
    message,
    level,
    tags: context?.tags,
    extra: context?.extra ? sanitizeErrorContext(context.extra) : undefined,
    timestamp: new Date().toISOString(),
  };

  if (isSentryEnabled()) {
    console.warn(`[Sentry:Production:${level}] Message captured:`, payload);
  } else {
    console.debug(`[Sentry:Local:${level}] Message captured:`, payload);
  }

  return eventId;
}
