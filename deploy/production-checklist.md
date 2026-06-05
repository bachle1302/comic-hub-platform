# Production Deployment Checklist

## A. Domain & SSL

- [ ] Frontend domain points to the server.
- [ ] API domain points to the server.
- [ ] HTTPS is active for frontend and API domains.
- [ ] WebSocket notifications work through Nginx.

## B. Environment

Backend:

- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL` uses the Docker `postgres` host.
- [ ] `REDIS_URL` uses the Docker `redis` host.
- [ ] JWT secrets are strong and not default.
- [ ] `CORS_ORIGINS` exactly matches the frontend domain.
- [ ] `APP_URL` exactly matches the frontend domain.
- [ ] `SENTRY_DSN` is set for production.
- [ ] S3/R2/MinIO env is set.
- [ ] PayOS env is set.
- [ ] Google OAuth env is set.
- [ ] SMTP env is set.

Frontend:

- [ ] `NEXT_PUBLIC_API_URL` exactly matches the API domain.
- [ ] `NEXT_PUBLIC_SITE_URL` exactly matches the frontend domain.
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set.
- [ ] `NEXT_PUBLIC_SENTRY_DSN` is set.

## C. Database

- [ ] Docker Compose services are up.
- [ ] Production backup created before migration.
- [ ] `npm run prisma:migrate:deploy` completed successfully.
- [ ] Seed is run only if intentional.

## D. Object Storage

- [ ] Bucket exists.
- [ ] Browser PUT CORS is configured for presigned uploads.
- [ ] Private paid image mode is configured if needed.
- [ ] Public/free image URLs work.
- [ ] Lifecycle/versioning policy is considered.

## E. Payments

- [ ] PayOS webhook uses a public HTTPS URL.
- [ ] Return and cancel URLs are correct.
- [ ] Small payment test succeeds.
- [ ] User coin increases once.
- [ ] Duplicate webhook does not double add coin.

## F. Auth

- [ ] Google OAuth JavaScript origin is set.
- [ ] Email verification works.
- [ ] Forgot/reset password works.

## G. Monitoring

- [ ] Backend Sentry captures server errors.
- [ ] Frontend Sentry captures client/server App Router errors.
- [ ] `/health` endpoint works.

## H. Backup

- [ ] Backup script tested.
- [ ] Restore script tested on staging.
- [ ] Object storage backup or versioning is enabled.

## I. Security

- [ ] Postgres is not exposed publicly.
- [ ] Redis is not exposed publicly.
- [ ] Admin demo password is changed or demo account removed.
- [ ] Seed demo accounts are disabled or changed.
- [ ] Rate limit is enabled.
- [ ] Redis/rate-limit outage behavior is understood and returns a clear error.
- [ ] JWT secrets are not defaults.
- [ ] `.env` files are not committed.
- [ ] `admin@manga.local / Admin@123456` is not used in production.
- [ ] Demo accounts are local/staging only or have passwords changed immediately.

## J. Final Smoke Test

- [ ] Login/register.
- [ ] Google login.
- [ ] Read free chapter.
- [ ] Buy paid chapter.
- [ ] Upload chapter image.
- [ ] Follow notification.
- [ ] Comment/report/like.
- [ ] Admin audit log.
- [ ] Payment recharge.
