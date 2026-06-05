# Security Checklist

Use this checklist before production deploys and after major auth/payment/admin changes.

## Secrets

- [ ] `JWT_ACCESS_SECRET` is strong, unique, at least 32 characters, and not a demo/default value.
- [ ] `JWT_REFRESH_SECRET` is strong, unique, at least 32 characters, and not a demo/default value.
- [ ] `.env`, `.env.production`, and backup files are not committed.
- [ ] `CORS_ORIGINS` is the exact frontend domain in production.
- [ ] `APP_URL` and `FRONTEND_URL` are the exact frontend domain.
- [ ] `SENTRY_DSN` is optional, but production values are not committed.

## Admin Guards

- [ ] All `/admin/*` list and mutation routes use `JwtAuthGuard` and `AdminGuard`.
- [ ] Admin upload presigned URL routes are admin-only.
- [ ] Admin dashboard/users/audit logs/comments/comment reports are admin-only.

## Auth Cookies

- [ ] Backend auth uses `Authorization: Bearer <token>` only.
- [ ] Next.js route handlers store refresh token in an HttpOnly cookie.
- [ ] Refresh cookie uses `secure: true` in production.
- [ ] Refresh cookie uses `sameSite: "lax"` or stricter.
- [ ] Refresh token is not returned to browser JSON.
- [ ] Access token is kept in RAM only.
- [ ] `localStorage` is not used for auth tokens.
- [ ] Banned users cannot refresh or call protected APIs.
- [ ] Password reset revokes active refresh tokens.
- [ ] Google login rejects unverified Google emails.

## Payment Webhook

- [ ] PayOS webhook verifies provider signature/checksum.
- [ ] Client-provided amount/status is not trusted.
- [ ] Webhook amount must match the stored order amount.
- [ ] Paid order processing is idempotent.
- [ ] Coin update, order status update, and transaction creation happen in one DB transaction.
- [ ] Duplicate webhook does not add coin twice.
- [ ] Provider payload is not logged with sensitive data.

## Paid Images

- [ ] Public reader does not return images for paid chapters.
- [ ] Protected reader verifies purchase before returning paid images.
- [ ] Paid images use signed URLs when object keys are available and private bucket mode is enabled.
- [ ] Signed read URL expiry is short, for example 300 seconds.
- [ ] Protected paid reader responses are not public-cached.
- [ ] Signed URLs are not logged.

## CORS / WebSocket

- [ ] Backend does not use `origin: "*"` with credentials.
- [ ] `CORS_ORIGINS` supports only trusted frontend origins.
- [ ] Notification WebSocket gateway uses the same allowed origins.
- [ ] Nginx proxies `/socket.io/` with upgrade headers.
- [ ] Nginx proxies `/notifications` with upgrade headers.

## Upload

- [ ] Presigned upload APIs are admin-only.
- [ ] Upload DTO validates image MIME type.
- [ ] Upload DTO limits image size.
- [ ] Object keys reject path traversal.
- [ ] Presigned PUT URLs are not logged.
- [ ] Object storage browser PUT CORS is configured.

## Rate Limit

- [ ] Global Redis token bucket guard is enabled.
- [ ] Auth routes have a stricter custom bucket.
- [ ] Comment/report/like mutations have custom buckets.
- [ ] Payment order creation has a custom bucket.
- [ ] If Redis/rate-limit storage is unavailable, API returns a clear `503`.

## Backup

- [ ] PostgreSQL backup script is tested.
- [ ] Restore script is tested on staging.
- [ ] Backup is created before production migrations.
- [ ] Object storage is backed up or has versioning/lifecycle policy.

## Demo Accounts

- [ ] `admin@manga.local / Admin@123456` is not used in production.
- [ ] `user@manga.local / User@123456` is not used in production.
- [ ] Demo accounts are local/staging only.
- [ ] If seed is run in production, passwords are changed immediately.

## Monitoring

- [ ] Backend Sentry captures 5xx errors.
- [ ] Frontend Sentry captures client/App Router errors.
- [ ] `/health` is reachable.
- [ ] Logs do not include Authorization headers, refresh tokens, passwords, or signed URLs.
