# Manga Platform

## CI

GitHub Actions workflow is defined in `.github/workflows/ci.yml`.

CI checks:

- Backend Prisma generate, migrate deploy, lint, build, and tests.
- Frontend lint and production build.
- Backend and frontend Docker image builds.
- No `any` usage in backend/frontend source.
- No legacy frontend token storage usage such as `localStorage`.

The workflow uses dummy test environment values only. Do not add real JWT, PayOS, Google, S3, or database secrets to the workflow file.

## Docker Production

Before production, complete the deployment checklist:

- `deploy/production-checklist.md`
- `deploy/security-checklist.md`
- `deploy/production-runbook.md`
- `deploy/release-checklist.md`
- `deploy/staging-smoke-test.md`
- `deploy/nginx/README.md`

Use `deploy/production-runbook.md` for first deploy, update deploy, rollback, backup/restore, logs, health checks, and troubleshooting.
Use `deploy/release-checklist.md` for version tags, release deploys, Sentry release alignment, and rollback steps.

### 1. Copy environment files

```bash
cp comic-hub-backend/.env.production.example comic-hub-backend/.env.production
cp fe/.env.production.example fe/.env.production
```

Fill real production values before building/running containers.

### 2. Required backend secrets/config

Backend production env must include real values for:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `FRONTEND_URL`
- `CORS_ORIGINS`
- `S3_ENDPOINT`
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_PUBLIC_URL`
- `PAYOS_CLIENT_ID`
- `PAYOS_API_KEY`
- `PAYOS_CHECKSUM_KEY`
- `PAYMENT_RETURN_URL`
- `PAYMENT_CANCEL_URL`
- `PAYMENT_WEBHOOK_URL`

Inside Docker, do not use `localhost` for database/cache:

- `DATABASE_URL` must use host `postgres`.
- `REDIS_URL` must use host `redis`.

### 3. Required frontend build env

Frontend public env is baked into the Next.js production build. Set these values in the shell or a root `.env` before `docker compose build` if deploying to real domains:

```bash
APP_VERSION=v1.0.0
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

`APP_VERSION` is used by Docker Compose for image tags and is passed to the frontend build as `NEXT_PUBLIC_APP_VERSION`.

Do not put Google client secret or JWT secrets in frontend env.

### 4. Build and start

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 5. Run database migrations

```bash
docker compose -f docker-compose.prod.yml exec backend npm run prisma:migrate:deploy
```

### 6. Optional seed

Run seed only when you intentionally want demo/initial data:

```bash
docker compose -f docker-compose.prod.yml exec backend npx prisma db seed
```

### 7. Check services

```bash
curl http://localhost:4000/health
```

The health response includes `version` and `environment`.

Open:

```txt
http://localhost:3000
```

Run the public smoke test:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/smoke-test.ps1
```

Use custom staging URLs:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/smoke-test.ps1 -BackendUrl https://api.example.com -FrontendUrl https://example.com
```

### Production Notes

- Do not commit `.env.production`.
- Do not run migrations or seed in Dockerfile.
- PayOS webhook URL must be a public HTTPS URL.
- Object Storage must allow browser PUT CORS for presigned uploads.
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` must be strong random strings.
- `CORS_ORIGINS` must match the real frontend domain.
- If using private paid chapter images, keep `S3_PRIVATE_BUCKET_MODE=true`.

## Database Backup & Restore

Use these scripts for the PostgreSQL database used by `docker-compose.prod.yml`.

Create backups:

- Before production migrations.
- Before large deploys or risky data operations.
- Daily for normal production operation.

### Backup

```powershell
powershell -ExecutionPolicy Bypass -File scripts/backup-db.ps1
```

The script runs `pg_dump` inside the Docker Compose `postgres` service and writes a timestamped SQL file to `backups/`, for example:

```txt
backups/manga_db_20260603_010203.sql
```

Configurable environment variables:

- `POSTGRES_USER`, default `postgres`
- `POSTGRES_DB`, default `manga_db`
- `POSTGRES_SERVICE`, default `postgres`

### Restore

Restore into the current database without dropping existing schema/data first:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/restore-db.ps1 -BackupFile backups/manga_db_20260603_010203.sql
```

Restore with a clean `public` schema first:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/restore-db.ps1 -BackupFile backups/manga_db_20260603_010203.sql -Clean
```

`-Clean` is destructive. It runs:

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

The restore script always asks you to type `YES` before continuing.

### Backup Safety Notes

- Do not commit database backups to GitHub.
- `backups/` is ignored except for `backups/.gitkeep`.
- Store production backups in a secure location outside the app server.
- Test restore periodically on a staging or local environment.
- PostgreSQL backups only contain database records and image metadata such as keys/URLs.
- Real image files in S3/R2/MinIO are not included in PostgreSQL backups.
- Back up object storage separately or enable bucket versioning/lifecycle policies.
- If the bucket is lost, the database may still have image keys/URLs, but the actual images are gone.
