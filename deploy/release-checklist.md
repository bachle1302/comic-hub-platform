# Release Checklist

Checklist nay dung de tao release/tag, deploy Docker image theo version, verify `/health`, va rollback neu can.

## A. Before Release

- [ ] CI tren `main` pass.
- [ ] Staging smoke test pass.
- [ ] Backup database.
- [ ] Kiem tra migration moi va rui ro rollback.
- [ ] Kiem tra production env.
- [ ] Chon version tag, vi du `v1.0.0`.

## B. Create Git Tag

```bash
git tag v1.0.0
git push origin v1.0.0
```

## C. Set Version

Windows PowerShell:

```powershell
$env:APP_VERSION = "v1.0.0"
```

Linux/macOS:

```bash
export APP_VERSION=v1.0.0
```

`APP_VERSION` duoc Docker Compose dung de tag image:

```txt
manga-backend:v1.0.0
manga-frontend:v1.0.0
```

Frontend cung nhan `NEXT_PUBLIC_APP_VERSION` tu `APP_VERSION` trong `docker-compose.prod.yml`, nen neu doi version thi can rebuild frontend image.

## D. Build / Deploy

```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec backend npm run prisma:migrate:deploy
```

## E. Verify

```bash
curl https://api.domain.com/health
```

Kiem tra:

- [ ] `status` la `ok`.
- [ ] `version` dung version vua deploy, vi du `v1.0.0`.
- [ ] `environment` la `production`.
- [ ] Frontend load duoc.
- [ ] Smoke test pass.
- [ ] Sentry khong bao loi bat thuong.

## F. Rollback

```bash
git checkout v0.9.0
```

Windows PowerShell:

```powershell
$env:APP_VERSION = "v0.9.0"
```

Deploy lai:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Chi restore DB neu migration/data moi yeu cau rollback database. Restore DB co the lam mat data phat sinh sau backup.

## G. Sentry

- Backend Sentry release dung `APP_VERSION`.
- Frontend Sentry release dung `NEXT_PUBLIC_APP_VERSION`.
- Neu CI dung GitHub SHA, release trong Sentry la commit SHA.
- Neu deploy bang tag, set `APP_VERSION` bang tag de Sentry release de doc hon.
- Khong bat sourcemap upload neu chua co `SENTRY_AUTH_TOKEN`.

