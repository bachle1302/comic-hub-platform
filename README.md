# Comic Hub Platform

Production-ready full-stack comic reading platform built with Next.js, NestJS, Prisma, PostgreSQL, Redis, Docker, PayOS, realtime notifications, admin dashboard, paid chapters, and CI/CD.

![Next.js](https://img.shields.io/badge/Next.js-App_Router-000000?logo=nextdotjs&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-API-E0234E?logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)

---

## 1. Overview

Comic Hub is a full-stack manga/comic platform for public comic discovery, free and paid chapter reading, coin payments, comments, follows, reading history, realtime notifications, and admin operations. The project is prepared for production-style deployment with Docker, CI, Sentry monitoring, backup/restore scripts, Nginx reverse proxy notes, security checklist, and release runbook.

---

## 2. Core Features

### Public / User

| Area | Features |
|---|---|
| Account | Register, login, logout, Google login, email verification, forgot/reset/change password |
| Comics | Browse comics, search, filter by category/author, rankings/top comics |
| Reader | Read free chapters, buy paid chapters with coins, protected signed image URLs |
| Wallet | Coin packages, wallet balance, payment orders, transaction history |
| Engagement | Follow comics, reading history, continue reading |
| Comments | Comments, one-level replies, likes, reports |
| Notifications | Notification bell, notification page, realtime Socket.IO updates |
| Support | Contact/support form |

### Admin

| Area | Features |
|---|---|
| Dashboard | Statistics and quick admin overview |
| Users | User management, ban/unban, adjust user coins, user transactions |
| Content | Authors, categories, comics, chapters, chapter image upload |
| Monetization | Coin package management |
| Moderation | Comments, comment reports, soft delete |
| Operations | Contact tickets, announcements/site banners, system settings, maintenance mode, audit logs |

### Production / DevOps

| Area | Features |
|---|---|
| Docker | Production Docker Compose setup |
| CI/CD | GitHub Actions checks |
| Monitoring | Sentry frontend/backend monitoring |
| Backup | PostgreSQL backup and restore scripts |
| Deployment | Nginx reverse proxy sample, production checklist, release checklist |
| Security | Secret scanning script, security checklist, staging smoke test |

---

## 3. Tech Stack

### Frontend

| Area | Technology |
|---|---|
| Framework | Next.js App Router, React |
| Language | TypeScript |
| UI | Tailwind CSS, shadcn/ui |
| Validation | Zod, React Hook Form |
| Auth client | Access token in RAM, refresh token through HttpOnly cookie route handlers |
| Realtime | Socket.IO Client |
| Monitoring | Sentry Next.js |

### Backend

| Area | Technology |
|---|---|
| Framework | NestJS |
| Language | TypeScript |
| ORM / DB | Prisma, PostgreSQL |
| Cache / Rate limit | Redis, token bucket rate limit |
| Auth | JWT, guards, admin guard |
| Realtime | Socket.IO WebSocket |
| Storage | S3-compatible Object Storage, R2/S3/MinIO |
| Payment | PayOS |
| Security | Helmet, Compression, Joi env validation |
| Monitoring | Sentry |

### Infrastructure & Security

| Area | Technology / Practice |
|---|---|
| Runtime | Docker, Docker Compose |
| Reverse proxy | Nginx sample config |
| CI | GitHub Actions |
| Backups | PostgreSQL backup/restore scripts |
| Secrets | Env examples only, local secret scan script |
| Paid images | Private bucket mode and short-lived signed URLs |
| Auditability | Soft delete, audit logs, admin moderation |

---

## 4. Project Architecture

```txt
comicnestjs/
+-- comic-hub-backend/     # NestJS backend
+-- fe/                    # Next.js frontend
+-- manga-crawler/         # Optional crawler/tooling
+-- deploy/                # Nginx, runbook, checklist
+-- scripts/               # Backup, restore, smoke test, secret scan
+-- .github/workflows/     # CI pipeline
+-- docker-compose.yml
+-- docker-compose.prod.yml
`-- README.md
```

**Backend**

- Modular NestJS structure with controllers, services, DTOs, guards, and specs.
- Prisma schema and migrations are the database source of truth.
- Modules cover auth, public comics, admin content, payments, notifications, support, audit logs, settings, comments, follows, histories, and reader access.

**Frontend**

- Feature-based architecture.
- Zod-first API schemas with inferred TypeScript types.
- Next.js App Router pages, shared API clients, shared UI, and layout widgets.
- Protected client requests use access token from RAM and no public cache.

---

## 5. System Architecture

```txt
Browser
  |
  v
Next.js Frontend
  |
  v
NestJS API
  |-- PostgreSQL
  |-- Redis
  |-- Object Storage
  |-- PayOS
  `-- Sentry
```

Realtime notifications use Socket.IO namespace `/notifications`.

---

## 6. Environment Files

Do not commit real env files. Only commit example files.

Allowed examples:

- `.env.example`
- `comic-hub-backend/.env.example`
- `comic-hub-backend/.env.production.example`
- `fe/.env.local.example`
- `fe/.env.production.example`
- `manga-crawler/.env.example`

### Docker production hostnames

When the backend runs inside Docker Compose, use service hostnames:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@postgres:5432/manga_db?schema=public
REDIS_URL=redis://redis:6379
```

Do not use `localhost` inside the backend container:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/manga_db?schema=public
REDIS_URL=redis://localhost:6379
```

`localhost` inside the backend container means the backend container itself, not the PostgreSQL or Redis container.

### Frontend public env

- `NEXT_PUBLIC_API_URL` is the API URL called by the browser.
- `NEXT_PUBLIC_SITE_URL` is the public website URL.
- Rebuild the frontend image whenever a `NEXT_PUBLIC_*` value changes.

---

## 7. Run with Docker

### Step 1: Copy env files

Linux/macOS:

```bash
cp comic-hub-backend/.env.production.example comic-hub-backend/.env.production
cp fe/.env.production.example fe/.env.production
```

Windows PowerShell:

```powershell
Copy-Item comic-hub-backend/.env.production.example comic-hub-backend/.env.production
Copy-Item fe/.env.production.example fe/.env.production
```

### Step 2: Update env values

Before starting Docker:

- Use `postgres` in `DATABASE_URL`.
- Use `redis` in `REDIS_URL`.
- Replace JWT secrets with strong production values.
- Set `NEXT_PUBLIC_API_URL` to the public API URL.
- Set `NEXT_PUBLIC_SITE_URL` to the public frontend URL.
- Configure PayOS, Google OAuth, SMTP, S3-compatible storage, and Sentry only with real production values outside Git.

### Step 3: Build and start

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### Step 4: Run migrations

```bash
docker compose -f docker-compose.prod.yml exec backend npm run prisma:migrate:deploy
```

### Step 5: Optional seed

```bash
docker compose -f docker-compose.prod.yml exec backend npx prisma db seed
```

### Step 6: Check

```bash
curl http://localhost:4000/health
```

Open:

```txt
http://localhost:3000
```

---

## 8. Useful Commands

| Area | Command |
|---|---|
| Backend build | `cd comic-hub-backend && npm run build` |
| Backend test | `cd comic-hub-backend && npm test` |
| Backend lint | `cd comic-hub-backend && npm run lint` |
| Frontend build | `cd fe && npm run build` |
| Frontend lint | `cd fe && npm run lint` |
| Docker status | `docker compose -f docker-compose.prod.yml ps` |
| Backend logs | `docker compose -f docker-compose.prod.yml logs -f backend` |
| Frontend logs | `docker compose -f docker-compose.prod.yml logs -f frontend` |
| Backup DB | `powershell -ExecutionPolicy Bypass -File scripts/backup-db.ps1` |
| Restore DB | `powershell -ExecutionPolicy Bypass -File scripts/restore-db.ps1 -BackupFile backups/xxx.sql` |
| Secret scan | `powershell -ExecutionPolicy Bypass -File scripts/scan-secrets.ps1` |

---

## 9. Production Notes

- Do not commit real `.env` files.
- Change all default secrets before production.
- Use HTTPS for PayOS webhook URLs.
- Configure Google OAuth origins in Google Cloud.
- Configure Object Storage CORS for direct browser uploads.
- Use private bucket mode and signed URLs for paid chapter images.
- Run a database backup before migrations.
- Monitor Sentry after deployment.
- Do not use demo admin credentials in production.

---

## 10. Documentation

| Document | Purpose |
|---|---|
| `deploy/production-runbook.md` | Production deploy, rollback, and troubleshooting |
| `deploy/production-checklist.md` | Go-live checklist |
| `deploy/security-checklist.md` | Security review checklist |
| `deploy/release-checklist.md` | Release and version tagging guide |
| `deploy/staging-smoke-test.md` | Staging smoke test checklist |
| `deploy/nginx/README.md` | Nginx and HTTPS deployment notes |

---

## 11. CI/CD

GitHub Actions is used to check:

- Backend lint, build, and tests.
- Frontend lint and build.
- Docker build readiness.
- No TypeScript `any`.
- No legacy `localStorage` token usage.
- Secret hygiene through local scanning before commit.

---

## 12. License / Disclaimer

This project is for educational and portfolio purposes. Please review legal, copyright, payment, and privacy requirements before using it in production.
