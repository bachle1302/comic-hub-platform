# Production Runbook

Runbook nay dung cho deploy lan dau, update version moi, migrate, backup/restore, rollback, restart, logs, health check, va troubleshooting cho manga/comic platform.

## 1. Tong Quan

Project gom:

- Backend: `comic-hub-backend/`
- Frontend: `fe/`
- Docker Compose production: `docker-compose.prod.yml`
- Checklist production: `deploy/production-checklist.md`
- Checklist security: `deploy/security-checklist.md`
- Smoke test staging/production: `deploy/staging-smoke-test.md`
- Backup/restore DB: `scripts/backup-db.ps1`, `scripts/restore-db.ps1`
- Nginx sample: `deploy/nginx/README.md`
- Release checklist: `deploy/release-checklist.md`

Nguyen tac:

- Khong commit secret that.
- Khong chay seed demo ngoai production neu khong co chu dich.
- Tao backup truoc deploy/migrate.
- Neu doi `NEXT_PUBLIC_*`, phai rebuild frontend image.
- Neu doi `APP_VERSION`, phai rebuild image de image tag va Sentry release khop version.

## 2. Env Production Cho Docker

### A. Backend `.env.production`

File:

```txt
comic-hub-backend/.env.production
```

Khi backend chay trong Docker, `DATABASE_URL` va `REDIS_URL` khong dung `localhost`.

Vi du dung:

```env
DATABASE_URL=postgresql://postgres:YOUR_STRONG_PASSWORD@postgres:5432/manga_db?schema=public
REDIS_URL=redis://redis:6379
```

Vi du sai:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/manga_db?schema=public
REDIS_URL=redis://localhost:6379
```

Ly do:

- `localhost` trong container backend la chinh container backend.
- `postgres` la service name cua Postgres trong `docker-compose.prod.yml`.
- `redis` la service name cua Redis trong `docker-compose.prod.yml`.

Bien backend bat buoc:

```env
NODE_ENV=production
PORT=4000
APP_VERSION=v1.0.0
DATABASE_URL=postgresql://postgres:YOUR_STRONG_PASSWORD@postgres:5432/manga_db?schema=public
REDIS_URL=redis://redis:6379
JWT_ACCESS_SECRET=CHANGE_ME_STRONG_ACCESS_SECRET_AT_LEAST_32_CHARS
JWT_REFRESH_SECRET=CHANGE_ME_STRONG_REFRESH_SECRET_AT_LEAST_32_CHARS
FRONTEND_URL=https://your-domain.com
CORS_ORIGINS=https://your-domain.com
APP_URL=https://your-domain.com
```

Bien theo tinh nang:

- S3/Object Storage upload/private image:
  - `S3_ENDPOINT`
  - `S3_REGION`
  - `S3_BUCKET`
  - `S3_ACCESS_KEY_ID`
  - `S3_SECRET_ACCESS_KEY`
  - `S3_PUBLIC_URL`
  - `S3_FORCE_PATH_STYLE`
  - `S3_PRIVATE_BUCKET_MODE`
  - `S3_SIGNED_READ_EXPIRES_SECONDS`
- PayOS:
  - `PAYOS_CLIENT_ID`
  - `PAYOS_API_KEY`
  - `PAYOS_CHECKSUM_KEY`
  - `PAYMENT_RETURN_URL`
  - `PAYMENT_CANCEL_URL`
  - `PAYMENT_WEBHOOK_URL`
- Google login:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
- Email verify/reset password:
  - `MAIL_HOST`
  - `MAIL_PORT`
  - `MAIL_USER`
  - `MAIL_PASSWORD`
  - `MAIL_FROM`
- Monitoring:
  - `SENTRY_DSN`
  - `SENTRY_ENVIRONMENT`
  - `APP_VERSION`

### B. Frontend `.env.production`

File:

```txt
fe/.env.production
```

Vi du local staging:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_SERVER_API_URL=http://backend:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

Vi du production domain:

```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_SERVER_API_URL=http://backend:4000
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

Luu y quan trong:

- `NEXT_PUBLIC_*` duoc bake vao frontend Docker image luc build.
- Neu doi `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, hoac `NEXT_PUBLIC_APP_VERSION`, phai rebuild frontend image.
- `NEXT_SERVER_API_URL` dung cho Next Server Components va Next route handlers trong Docker. No nen dung service name `http://backend:4000`.
- Browser khong truy cap duoc `http://backend:4000`; browser phai dung public API URL nhu `https://api.your-domain.com` hoac `http://localhost:4000`.
- Khong dat Google client secret/JWT secret vao frontend env.

## 2.1 APP_VERSION / Release Tag

`APP_VERSION` dung cho:

- Docker image tag trong `docker-compose.prod.yml`.
- Backend `/health.version`.
- Backend Sentry release.
- Frontend `NEXT_PUBLIC_APP_VERSION` khi build image.
- Frontend Sentry release.

Mac dinh neu khong set la `local`.

Windows PowerShell:

```powershell
$env:APP_VERSION = "v1.0.0"
```

Linux/macOS:

```bash
export APP_VERSION=v1.0.0
```

Kiem tra compose da nhan image tag:

```bash
docker compose -f docker-compose.prod.yml config
```

Sau deploy, kiem tra:

```bash
curl http://localhost:4000/health
```

Response nen co:

```json
{
  "status": "ok",
  "version": "v1.0.0",
  "environment": "production"
}
```

Neu doi `APP_VERSION`, rebuild frontend image de `NEXT_PUBLIC_APP_VERSION` va Sentry release frontend cap nhat.

## 3. Deploy Lan Dau

### 1. Clone repo

```bash
git clone <repo-url>
cd comicnestjs
```

### 2. Copy env

```bash
cp comic-hub-backend/.env.production.example comic-hub-backend/.env.production
cp fe/.env.production.example fe/.env.production
```

### 3. Dien env that

Kiem tra ky:

- Backend `DATABASE_URL` dung host `postgres`.
- Backend `REDIS_URL` dung host `redis`.
- Backend `CORS_ORIGINS` dung frontend domain that.
- Frontend `NEXT_PUBLIC_API_URL` dung public API domain.
- Frontend `NEXT_SERVER_API_URL` dung `http://backend:4000` khi chay Docker Compose.

### 4. Build/start

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 5. Migrate

```bash
docker compose -f docker-compose.prod.yml exec backend npm run prisma:migrate:deploy
```

### 6. Optional seed

Chi chay seed neu that su muon tao demo/initial data:

```bash
docker compose -f docker-compose.prod.yml exec backend npx prisma db seed
```

Can luu y: production image co the khong co dev dependency nhu `ts-node`. Neu seed TypeScript fail, chay seed tu moi truong dev/staging co day du dependency, hoac tao seed image/job rieng.

### 7. Health check

```bash
curl http://localhost:4000/health
```

### 8. Mo frontend

```txt
http://localhost:3000
```

## 4. Deploy Update Version Moi

Quy trinh an toan:

### 1. Pull code moi

```bash
git pull origin main
```

### 2. Tao backup DB

```powershell
powershell -ExecutionPolicy Bypass -File scripts/backup-db.ps1
```

### 3. Build image moi

```bash
docker compose -f docker-compose.prod.yml build
```

### 4. Start/recreate

```bash
docker compose -f docker-compose.prod.yml up -d
```

### 5. Migrate

```bash
docker compose -f docker-compose.prod.yml exec backend npm run prisma:migrate:deploy
```

### 6. Check logs

```bash
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
```

### 7. Smoke test

```powershell
powershell -ExecutionPolicy Bypass -File scripts/smoke-test.ps1
```

Neu smoke test fail, xem phan rollback.

## 5. Backup / Restore

### Backup

```powershell
powershell -ExecutionPolicy Bypass -File scripts/backup-db.ps1
```

### Restore

```powershell
powershell -ExecutionPolicy Bypass -File scripts/restore-db.ps1 -BackupFile backups/xxx.sql
```

### Restore clean

```powershell
powershell -ExecutionPolicy Bypass -File scripts/restore-db.ps1 -BackupFile backups/xxx.sql -Clean
```

Canh bao:

- `-Clean` xoa schema `public` hien tai truoc khi restore.
- Chi dung khi chac chan dung DB target va dung backup file.
- Backup DB khong chua file anh trong S3/R2/MinIO.
- Can backup object storage rieng hoac bat bucket versioning/lifecycle policy.

## 6. Rollback Co Ban

### Rollback code

1. Checkout commit/tag truoc do:

```bash
git checkout <previous_commit_or_tag>
```

2. Rebuild/recreate:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

3. Kiem tra logs/health:

```bash
docker compose -f docker-compose.prod.yml logs -f backend
curl http://localhost:4000/health
```

### Rollback DB

Chi restore backup neu migration/data moi gay loi nghiem trong.

Luu y:

- Restore DB co the lam mat data moi phat sinh sau thoi diem backup.
- Uu tien tao backup truoc moi lan deploy.
- Neu migration da chay, can doc migration moi truoc khi quyet dinh restore.

### Tao tag truoc deploy

Nen tao Git tag truoc deploy:

```bash
git tag prod-YYYYMMDD-HHMM
git push origin prod-YYYYMMDD-HHMM
```

## 7. Logs / Debug

### Trang thai services

```bash
docker compose -f docker-compose.prod.yml ps
```

### Logs

```bash
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f postgres
docker compose -f docker-compose.prod.yml logs -f redis
```

### Restart service

```bash
docker compose -f docker-compose.prod.yml restart backend
docker compose -f docker-compose.prod.yml restart frontend
```

### Rebuild rieng mot service

```bash
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml up -d backend
```

```bash
docker compose -f docker-compose.prod.yml build frontend
docker compose -f docker-compose.prod.yml up -d frontend
```

## 8. Troubleshooting

### 1. Backend khong connect duoc DB

Nguyen nhan thuong gap:

- `DATABASE_URL` dung `localhost` trong Docker.
- Postgres service chua ready.
- Password/database name sai.

Sua:

```env
DATABASE_URL=postgresql://postgres:YOUR_STRONG_PASSWORD@postgres:5432/manga_db?schema=public
```

Sau do restart backend:

```bash
docker compose -f docker-compose.prod.yml restart backend
```

### 2. Backend khong connect Redis

Nguyen nhan:

- `REDIS_URL` dung `localhost`.

Sua:

```env
REDIS_URL=redis://redis:6379
```

### 3. Frontend goi sai API

Nguyen nhan:

- `NEXT_PUBLIC_API_URL` sai.
- Doi `NEXT_PUBLIC_API_URL` nhung chua rebuild frontend.
- Server Components dung public URL noi bo sai.

Sua:

```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_SERVER_API_URL=http://backend:4000
```

Rebuild:

```bash
docker compose -f docker-compose.prod.yml build frontend
docker compose -f docker-compose.prod.yml up -d frontend
```

### 4. Google login bao not configured

Nguyen nhan:

- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` rong.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` backend rong.
- Google OAuth origin chua co domain frontend.

Sua:

- Dien FE env va rebuild frontend.
- Dien backend env va restart backend.
- Them JavaScript origin va redirect/origin hop le trong Google Cloud.

### 5. Verify email khong gui

Nguyen nhan:

- SMTP env thieu/sai.

Sua:

- Kiem tra `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASSWORD`, `MAIL_FROM`.
- Xem backend logs de lay dev email URL neu SMTP chua cau hinh.

### 6. PayOS webhook khong chay

Nguyen nhan:

- Webhook URL khong public HTTPS.
- `PAYOS_CHECKSUM_KEY` sai.
- Nginx chua proxy API dung.

Sua:

```env
PAYMENT_WEBHOOK_URL=https://api.your-domain.com/payments/payos/webhook
```

Kiem tra PayOS dashboard va backend logs.

### 7. Upload anh loi

Nguyen nhan:

- S3 env sai.
- Bucket CORS chua cho browser PUT.
- MIME/size bi chan.
- Public URL sai.

Sua:

- Kiem tra `S3_ENDPOINT`, `S3_BUCKET`, `S3_PUBLIC_URL`.
- Cho phep PUT tu frontend domain trong bucket CORS.
- Chi upload `image/jpeg`, `image/png`, `image/webp`, max 20MB.

### 8. Paid image khong hien

Nguyen nhan:

- `ChapterImage.key` null.
- Signed URL het han.
- Private bucket config sai.

Sua:

- Dam bao paid images co `key`.
- Refetch reader de lay signed URL moi.
- Kiem tra `S3_PRIVATE_BUCKET_MODE` va `S3_SIGNED_READ_EXPIRES_SECONDS`.

### 9. WebSocket notification khong realtime

Nguyen nhan:

- Nginx chua proxy Socket.IO/WebSocket.
- `CORS_ORIGINS` sai.
- FE socket connect bang API URL sai.

Sua:

- Kiem tra `deploy/nginx/README.md`.
- Dam bao API domain proxy WebSocket upgrade headers.
- Dam bao `CORS_ORIGINS` co frontend domain.

### 10. Production fail vi JWT secret yeu

Nguyen nhan:

- Dung default secret.
- Dung `CHANGE_ME`.
- Secret ngan hon 32 ky tu.

Sua:

- Tao secret random manh cho `JWT_ACCESS_SECRET` va `JWT_REFRESH_SECRET`.
- Khong commit secret vao git.

## 9. Smoke Test Sau Deploy

Test nhanh:

- [ ] `/health` OK.
- [ ] FE load OK.
- [ ] Login OK.
- [ ] Admin load OK.
- [ ] Comic detail OK.
- [ ] Free reader OK.
- [ ] Paid reader locked neu chua mua.
- [ ] Purchase paid chapter OK.
- [ ] Comment OK.
- [ ] Notification OK.
- [ ] Payment packages load OK.
- [ ] Sentry khong bao loi bat thuong.

Chay script:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/smoke-test.ps1
```

Custom URL:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/smoke-test.ps1 -BackendUrl https://api.your-domain.com -FrontendUrl https://your-domain.com
```

## 10. Checklist Truoc Khi Roi May

- [ ] `docker compose -f docker-compose.prod.yml ps` tat ca service dang up.
- [ ] Backend logs khong co loi lap lai.
- [ ] Frontend logs khong co Server Components render error.
- [ ] `/health` OK.
- [ ] Smoke test OK.
- [ ] Backup moi nhat da co.
- [ ] Sentry khong bao loi bat thuong.
