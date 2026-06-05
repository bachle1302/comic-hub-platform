const sensitiveKeys = [
  "authorization",
  "cookie",
  "password",
  "token",
  "secret",
  "refreshToken",
  "accessToken",
];

function shouldRedact(key: string): boolean {
  const normalizedKey = key.toLowerCase();

  return sensitiveKeys.some((sensitiveKey) =>
    normalizedKey.includes(sensitiveKey.toLowerCase()),
  );
}

export function sanitizeSentryValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeSentryValue(item));
  }

  if (typeof value !== "object" || value === null) {
    return value;
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, item] of Object.entries(value)) {
    sanitized[key] = shouldRedact(key) ? "[Filtered]" : sanitizeSentryValue(item);
  }

  return sanitized;
}

export function getSentryEnvironment(): string {
  return process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? "development";
}

export function getSentryRelease(): string | undefined {
  return process.env.NEXT_PUBLIC_APP_VERSION || undefined;
}
