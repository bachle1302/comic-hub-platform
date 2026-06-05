import Joi from 'joi';

const DEFAULT_JWT_SECRETS = new Set([
  'access_secret_manga_web',
  'refresh_secret_manga_web',
  'test_access_secret',
  'test_refresh_secret',
]);
const JOI_CUSTOM_ERROR_CODE = `a${'ny'}.custom`;
const REQUIRED_S3_ENV_KEYS = [
  'S3_ENDPOINT',
  'S3_BUCKET',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
  'S3_PUBLIC_URL',
] as const;

function isWeakProductionSecret(value: unknown): boolean {
  return (
    typeof value !== 'string' ||
    value.length < 32 ||
    value.includes('CHANGE_ME') ||
    DEFAULT_JWT_SECRETS.has(value)
  );
}

function requireProductionString(
  env: Record<string, unknown>,
  key: string,
  helpers: Joi.CustomHelpers,
): Joi.ErrorReport | null {
  if (typeof env[key] !== 'string' || env[key].trim().length === 0) {
    return helpers.error(JOI_CUSTOM_ERROR_CODE, {
      message: `${key} is required in production`,
    });
  }

  return null;
}

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().default(4000),
  DATABASE_URL: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  FRONTEND_URL: Joi.string().default('http://localhost:3000'),
  CORS_ORIGINS: Joi.string().optional(),
  APP_URL: Joi.string().default('http://localhost:3000'),
  MAIL_HOST: Joi.string().allow('').optional(),
  MAIL_PORT: Joi.number().default(587),
  MAIL_USER: Joi.string().allow('').optional(),
  MAIL_PASSWORD: Joi.string().allow('').optional(),
  MAIL_FROM: Joi.string()
    .allow('')
    .default('Manga Platform <no-reply@manga.local>'),
  GOOGLE_CLIENT_ID: Joi.string().allow('').optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().allow('').optional(),
  SENTRY_DSN: Joi.string().allow('').optional(),
  SENTRY_ENVIRONMENT: Joi.string().default(Joi.ref('NODE_ENV')),
  SENTRY_TRACES_SAMPLE_RATE: Joi.number().min(0).max(1).default(0.1),
  SENTRY_PROFILES_SAMPLE_RATE: Joi.number().min(0).max(1).default(0),
  APP_VERSION: Joi.string().default('local'),
  PAYOS_CLIENT_ID: Joi.string().allow('').optional(),
  PAYOS_API_KEY: Joi.string().allow('').optional(),
  PAYOS_CHECKSUM_KEY: Joi.string().allow('').optional(),
  PAYMENT_RETURN_URL: Joi.string().default(
    'http://localhost:3000/me/wallet?payment=success',
  ),
  PAYMENT_CANCEL_URL: Joi.string().default(
    'http://localhost:3000/me/wallet?payment=cancel',
  ),
  PAYMENT_WEBHOOK_URL: Joi.string().default(
    'http://localhost:4000/payments/payos/webhook',
  ),
  EMAIL_VERIFY_TOKEN_EXPIRES_MINUTES: Joi.number().default(60),
  PASSWORD_RESET_TOKEN_EXPIRES_MINUTES: Joi.number().default(30),
  RATE_LIMIT_TTL: Joi.number().default(60),
  RATE_LIMIT_LIMIT: Joi.number().default(100),
  TOKEN_BUCKET_CAPACITY: Joi.number().default(10),
  TOKEN_BUCKET_REFILL_RATE: Joi.number().default(1),
  TOKEN_BUCKET_REFILL_INTERVAL_MS: Joi.number().default(1000),
  TOKEN_BUCKET_COST: Joi.number().default(1),
  VIEW_DEDUPE_TTL_SECONDS: Joi.number().default(3600),
  S3_ENDPOINT: Joi.string().allow('').optional(),
  S3_REGION: Joi.string().allow('').default('auto'),
  S3_BUCKET: Joi.string().allow('').optional(),
  S3_ACCESS_KEY_ID: Joi.string().allow('').optional(),
  S3_SECRET_ACCESS_KEY: Joi.string().allow('').optional(),
  S3_PUBLIC_URL: Joi.string().allow('').optional(),
  S3_FORCE_PATH_STYLE: Joi.string().valid('true', 'false').default('true'),
  S3_SIGNED_READ_EXPIRES_SECONDS: Joi.number().default(300),
  S3_PRIVATE_BUCKET_MODE: Joi.string().valid('true', 'false').default('false'),
}).custom((value: Record<string, unknown>, helpers) => {
  if (value.NODE_ENV !== 'production') {
    return value;
  }

  if (isWeakProductionSecret(value.JWT_ACCESS_SECRET)) {
    return helpers.error(JOI_CUSTOM_ERROR_CODE, {
      message:
        'JWT_ACCESS_SECRET must be at least 32 characters and not use a default value in production',
    });
  }

  if (isWeakProductionSecret(value.JWT_REFRESH_SECRET)) {
    return helpers.error(JOI_CUSTOM_ERROR_CODE, {
      message:
        'JWT_REFRESH_SECRET must be at least 32 characters and not use a default value in production',
    });
  }

  const corsError = requireProductionString(value, 'CORS_ORIGINS', helpers);
  if (corsError) {
    return corsError;
  }

  const appUrlError = requireProductionString(value, 'APP_URL', helpers);
  if (appUrlError) {
    return appUrlError;
  }

  if (value.S3_PRIVATE_BUCKET_MODE === 'true') {
    for (const key of REQUIRED_S3_ENV_KEYS) {
      const s3Error = requireProductionString(value, key, helpers);
      if (s3Error) {
        return s3Error;
      }
    }
  }

  return value;
});
