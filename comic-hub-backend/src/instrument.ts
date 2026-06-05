import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

const sensitiveKeys = [
  'authorization',
  'cookie',
  'password',
  'token',
  'secret',
  'refreshToken',
  'accessToken',
];

function shouldRedact(key: string): boolean {
  const normalizedKey = key.toLowerCase();

  return sensitiveKeys.some((sensitiveKey) =>
    normalizedKey.includes(sensitiveKey.toLowerCase()),
  );
}

function sanitizeObject(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeObject(item));
  }

  if (typeof value !== 'object' || value === null) {
    return value;
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, item] of Object.entries(value)) {
    sanitized[key] = shouldRedact(key) ? '[Filtered]' : sanitizeObject(item);
  }

  return sanitized;
}

const sentryDsn = process.env.SENTRY_DSN;
const isTestEnvironment = process.env.NODE_ENV === 'test';

if (!isTestEnvironment && sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    release: process.env.APP_VERSION,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    profilesSampleRate: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE ?? 0),
    integrations: [nodeProfilingIntegration()],
    beforeSend(event) {
      if (event.request?.headers) {
        event.request.headers = sanitizeObject(event.request.headers) as Record<
          string,
          string
        >;
      }

      if (event.request?.data) {
        event.request.data = sanitizeObject(event.request.data);
      }

      return event;
    },
  });
}
