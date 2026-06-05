import * as Sentry from "@sentry/nextjs";
import {
  getSentryEnvironment,
  getSentryRelease,
  sanitizeSentryValue,
} from "./sentry.shared";

const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: getSentryEnvironment(),
    release: getSentryRelease(),
    tracesSampleRate: 0.1,
    beforeSend(event) {
      if (event.request?.headers) {
        event.request.headers = sanitizeSentryValue(event.request.headers) as Record<
          string,
          string
        >;
      }

      if (event.request?.data) {
        event.request.data = sanitizeSentryValue(event.request.data);
      }

      return event;
    },
  });
}
