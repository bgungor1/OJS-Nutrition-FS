/**
 * Tipli config nesnesi. Controller/service'ler env'i doğrudan process.env'den
 * değil, ConfigService<AppConfig> üzerinden okur.
 */
export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiGlobalPrefix: string;
  corsOrigins: string[];
  databaseUrl: string;
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpires: string;
    refreshExpires: string;
  };
  google: {
    clientId?: string;
    clientSecret?: string;
    callbackUrl?: string;
  };
  iyzico: {
    apiKey?: string;
    secretKey?: string;
    baseUrl: string;
  };
  media: {
    baseUrl: string;
    storagePath: string;
  };
  throttle: {
    ttl: number;
    limit: number;
  };
}

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  apiGlobalPrefix: process.env.API_GLOBAL_PREFIX ?? 'api/v1',
  corsOrigins: (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    accessExpires: process.env.JWT_ACCESS_EXPIRES ?? '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES ?? '7d',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  },
  iyzico: {
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    baseUrl: process.env.IYZICO_BASE_URL ?? 'https://sandbox-api.iyzipay.com',
  },
  media: {
    baseUrl: process.env.MEDIA_BASE_URL ?? 'http://localhost:3000/media',
    storagePath: process.env.MEDIA_STORAGE_PATH ?? './media',
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
  },
});
