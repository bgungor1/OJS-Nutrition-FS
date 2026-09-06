import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/**
 * Zorunlu env değişkenleri uygulama başlamadan doğrulanır (fail-fast) —
 * bkz. ENGINEERING_STANDARDS §2 "Env validasyonu".
 */
export class EnvironmentVariables {
  @IsEnum(NodeEnv)
  @IsOptional()
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @IsInt()
  @Min(1)
  @IsOptional()
  PORT = 3000;

  @IsString()
  @IsOptional()
  API_GLOBAL_PREFIX = 'api/v1';

  @IsString()
  @IsNotEmpty()
  CORS_ORIGIN!: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsOptional()
  DIRECT_URL?: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET!: string;

  @IsString()
  @IsOptional()
  JWT_ACCESS_EXPIRES = '15m';

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRES = '7d';

  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_ID?: string;

  @IsString()
  @IsOptional()
  GOOGLE_CLIENT_SECRET?: string;

  @IsString()
  @IsOptional()
  GOOGLE_CALLBACK_URL?: string;

  @IsString()
  @IsOptional()
  IYZICO_API_KEY?: string;

  @IsString()
  @IsOptional()
  IYZICO_SECRET_KEY?: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  IYZICO_BASE_URL = 'https://sandbox-api.iyzipay.com';

  @IsUrl({ require_tld: false })
  @IsOptional()
  MEDIA_BASE_URL = 'http://localhost:3000/media';

  @IsString()
  @IsOptional()
  MEDIA_STORAGE_PATH = './media';

  @IsInt()
  @Min(1)
  @IsOptional()
  THROTTLE_TTL = 60;

  @IsInt()
  @Min(1)
  @IsOptional()
  THROTTLE_LIMIT = 100;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment configuration:\n${errors
        .map(
          (e) =>
            `  - ${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`,
        )
        .join('\n')}`,
    );
  }

  return validated;
}
