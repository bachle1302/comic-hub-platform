# Staging Smoke Test Checklist

Use this checklist after deploying the production Docker stack to a staging environment. It is intentionally end-to-end and should be run before promoting the same build/config style to production.

## A. Docker Startup

- [ ] Copy production env examples into staging env files.
- [ ] Fill staging values. Do not use production secrets unless this is the actual production server.
- [ ] Run `docker compose -f docker-compose.prod.yml up -d --build`.
- [ ] Run `docker compose -f docker-compose.prod.yml ps`.
- [ ] Check backend logs: `docker compose -f docker-compose.prod.yml logs backend`.
- [ ] Check frontend logs: `docker compose -f docker-compose.prod.yml logs frontend`.

## B. Database Migration

- [ ] Run `docker compose -f docker-compose.prod.yml exec backend npm run prisma:migrate:deploy`.
- [ ] Optional staging seed: `docker compose -f docker-compose.prod.yml exec backend npx prisma db seed`.

## C. Health

- [ ] `GET http://localhost:4000/health`.
- [ ] Open `http://localhost:3000`.
- [ ] Run `powershell -ExecutionPolicy Bypass -File scripts/smoke-test.ps1`.

## D. Auth

- [ ] Register a new user.
- [ ] Verify email through the staging/dev mail flow.
- [ ] Login with email/password.
- [ ] Logout.
- [ ] Forgot password.
- [ ] Reset password.
- [ ] Login with the new password.
- [ ] Google login works if Google env is configured.

## E. Admin

- [ ] Login as a staging admin.
- [ ] `/admin` dashboard loads.
- [ ] Admin users page loads.
- [ ] Admin can ban/unban a user.
- [ ] Audit log contains `BAN_USER` and `UNBAN_USER`.
- [ ] Admin can adjust user coin.
- [ ] Audit log contains `ADJUST_USER_COIN`.

## F. Comics And Admin Content

- [ ] Admin creates an author.
- [ ] Admin creates a category.
- [ ] Admin creates a comic.
- [ ] Admin uploads chapter images.
- [ ] Admin creates a free chapter.
- [ ] Admin creates a paid chapter.
- [ ] Public comic detail displays the comic.
- [ ] Free chapter can be read.
- [ ] Paid chapter public response does not expose images.

## G. Purchase And Paid Reader

- [ ] Test user has coin.
- [ ] User buys a paid chapter.
- [ ] User coin decreases.
- [ ] Transaction is created.
- [ ] Protected reader returns signed URLs for paid images.
- [ ] Paid image link expires according to `S3_SIGNED_READ_EXPIRES_SECONDS`.

## H. Payment

- [ ] `GET /payments/coin-packages` works.
- [ ] Create a payment order.
- [ ] Response contains a `checkoutUrl`.
- [ ] PayOS webhook public/staging URL is correct if testing real payment.
- [ ] Payment success adds coin only once.
- [ ] Duplicate webhook does not double-add coin.

## I. Follow And Notification

- [ ] User follows a comic.
- [ ] Admin creates a new chapter for that comic.
- [ ] User receives a notification.
- [ ] If WebSocket is enabled, notification bell count increases realtime.
- [ ] Clicking notification opens the new chapter.

## J. Comments

- [ ] User comments on a comic.
- [ ] User replies to a comment.
- [ ] User likes/unlikes a comment.
- [ ] User reports a comment.
- [ ] Admin comment reports page loads.
- [ ] Admin resolves/rejects a report.
- [ ] Admin deletes a reported comment.
- [ ] Deleted comments are soft-deleted and shown correctly.

## K. Ranking, Views, And History

- [ ] Reading a free chapter records a view with dedupe.
- [ ] Ranking page loads.
- [ ] Reading history saves while reading.
- [ ] Continue reading opens the expected chapter.
- [ ] `POST /histories` is not spammed while scrolling.

## L. SEO

- [ ] `/sitemap.xml` loads.
- [ ] `/robots.txt` loads.
- [ ] Comic detail metadata renders without error.
- [ ] Chapter metadata renders without error.

## M. Backup

- [ ] Run staging backup.
- [ ] Test restore on a staging clone if available.
- [ ] Never restore into real production unless the target and backup are confirmed.

## N. Sentry

- [ ] `SENTRY_DSN` is set for staging.
- [ ] Backend captures a safe 500 test if available.
- [ ] Frontend error boundary works.
- [ ] Sentry events do not expose token/password values.

## O. Final Security

- [ ] No demo admin password is used in staging/production.
- [ ] JWT secrets are strong.
- [ ] CORS matches the staging frontend domain.
- [ ] Redis/Postgres are not publicly exposed.
- [ ] Object storage CORS allows required browser PUT only.
- [ ] PayOS webhook uses a public HTTPS URL.
