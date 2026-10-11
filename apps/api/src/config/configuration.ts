/**
 * Tipli config nesnesi. Controller/service'ler env'i doğrudan process.env'den
 * değil, ConfigService<AppConfig> üzerinden okur.
 */
export interface DatabaseConfig {
  url: string;
  directUrl?: string;
  connectionLimit?: number;
  poolTimeout?: number;
  connectTimeout?: number;
  transactionTimeout?: number;
  transactionMaxWait?: number;
  pgbouncer?: boolean;
}

export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiGlobalPrefix: string;
  corsOrigins: string[];
  databaseUrl: string;
  database: DatabaseConfig;
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
  database: {
    url: process.env.DATABASE_URL ?? '',
    directUrl: process.env.DIRECT_URL,
    connectionLimit: process.env.DATABASE_CONNECTION_LIMIT
      ? parseInt(process.env.DATABASE_CONNECTION_LIMIT, 10)
      : undefined,
    poolTimeout: process.env.DATABASE_POOL_TIMEOUT
      ? parseInt(process.env.DATABASE_POOL_TIMEOUT, 10)
      : undefined,
    connectTimeout: process.env.DATABASE_CONNECT_TIMEOUT
      ? parseInt(process.env.DATABASE_CONNECT_TIMEOUT, 10)
      : undefined,
    transactionTimeout: process.env.DATABASE_TRANSACTION_TIMEOUT
      ? parseInt(process.env.DATABASE_TRANSACTION_TIMEOUT, 10)
      : undefined,
    transactionMaxWait: process.env.DATABASE_TRANSACTION_MAX_WAIT
      ? parseInt(process.env.DATABASE_TRANSACTION_MAX_WAIT, 10)
      : undefined,
    pgbouncer: process.env.DATABASE_PGBOUNCER
      ? process.env.DATABASE_PGBOUNCER === 'true'
      : undefined,
  },
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
