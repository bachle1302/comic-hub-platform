import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  release: {
    name: process.env.NEXT_PUBLIC_APP_VERSION,
    create: Boolean(process.env.SENTRY_AUTH_TOKEN),
    finalize: Boolean(process.env.SENTRY_AUTH_TOKEN),
  },
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
  },
});
