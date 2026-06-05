# Manga Platform Codex Skill

## 1. Project Overview

This project is a real manga/comic reading platform, not a simple school demo.

The system uses:

- Frontend: Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui
- Backend: NestJS + TypeScript
- Database: PostgreSQL + Prisma ORM
- Cache: Redis
- Object Storage: S3-compatible storage, for example Cloudflare R2, AWS S3, MinIO
- Authentication: JWT access token + refresh token
- API communication: REST API
- Backend auth transport: `Authorization: Bearer <token>` header only
- Frontend auth session: access token in RAM, refresh token in HttpOnly cookie through Next.js Route Handlers
- Frontend validation/types: Zod-first schemas with `z.infer`
- No backend cookie-based auth
- No mock data in production code

The project architecture is:

```txt
comic-platform/
├── be/                  # NestJS backend
├── fe/                  # Next.js frontend
├── docker-compose.yml   # PostgreSQL + Redis local infra
├── README.md
└── SKILL.md
```

Backend is the source of truth for business logic. Frontend calls backend APIs and must not contain fake fallback data.

---

# 2. Architecture Decision

This project uses:

```txt
Backend: Clean Architecture
Frontend: Feature-based Clean Architecture + Zod-first types
```

Backend should separate:
- Domain
- Application / Use Cases
- Infrastructure
- Interface / HTTP

Frontend should be organized by feature:
- shared
- features
- widgets
- app

Do not use a frontend layer-first structure such as:

```txt
domain/
application/
infrastructure/
interface/
services/
```

for new frontend code. Frontend must be feature-first.

---

# 3. Backend Clean Architecture

## 3.1 Backend Root Structure

Preferred backend structure:

```txt
be/src/
├── main.ts
├── app.module.ts
├── common/
│   ├── filters/
│   ├── interceptors/
│   ├── types/
│   ├── utils/
│   └── pagination/
├── modules/
│   ├── auth/
│   ├── comics/
│   ├── authors/
│   ├── categories/
│   ├── chapters/
│   ├── search/
│   ├── upload/
│   ├── purchases/
│   └── reading-history/
├── infrastructure/
│   ├── prisma/
│   ├── redis/
│   ├── storage/
│   └── security/
└── shared/
    ├── constants/
    ├── errors/
    └── types/
```

For a significant backend module:

```txt
be/src/modules/{feature}/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   └── errors/
├── application/
│   ├── ports/
│   ├── use-cases/
│   └── dto/
├── infrastructure/
│   ├── repositories/
│   └── mappers/
├── interface/
│   ├── http/
│   │   ├── controllers/
│   │   ├── dto/
│   │   └── presenters/
│   └── guards/
└── {feature}.module.ts
```

For small or already existing modules, a simpler NestJS controller/service structure is acceptable. Do not rewrite working modules unless explicitly asked.

## 3.2 Backend Dependency Rule

Dependencies point inward:

```txt
Interface / HTTP
        ↓
Application / Use Cases
        ↓
Domain

Infrastructure implements application ports.
```

Domain and application must not depend on Prisma, Redis, S3, or HTTP controllers.

## 3.3 Backend Layer Rules

### Domain Layer

Allowed:
- Entity classes
- Value objects
- Domain errors
- Pure TypeScript business rules

Forbidden:
- NestJS decorators
- Prisma
- Redis
- S3
- Request/Response
- class-validator DTOs
- process.env

### Application Layer

Allowed:
- Use cases
- Repository ports/interfaces
- Service ports/interfaces
- Application DTOs
- Transaction orchestration where needed

Forbidden:
- Prisma client directly
- Redis client directly
- S3 client directly
- HTTP controllers
- Request/Response objects

Use cases should be classes with an `execute()` method.

### Infrastructure Layer

Allowed:
- Prisma repository implementations
- Redis cache service
- S3/R2/MinIO storage service
- Hashing service
- JWT service adapter
- External integrations

Infrastructure implements application ports.

### Interface Layer

Allowed:
- Controllers
- Route DTOs
- Guards
- Presenters
- Param/body/header extraction

Forbidden:
- Business logic
- Prisma calls
- Redis calls
- S3 calls

Controllers should call use cases or application services only.

---

# 4. Backend Current Practical Rule

The project already has some backend modules implemented in a standard NestJS service/controller style.

Do not rewrite everything unless explicitly asked.

For new backend features:
- Prefer Clean Architecture structure.
- If modifying old modules, do not break existing APIs.
- Move business logic into use cases only when it is practical.
- Avoid large refactors unless requested.

---

# 5. Database Rules

Use Prisma with PostgreSQL.

Current schema contains:

- User
- RefreshToken
- Comic
- Chapter
- ChapterImage
- Author
- Category
- ComicCategory
- Comment
- Follow
- History
- Purchase
- Transaction

Do not replace or change Prisma schema unless explicitly asked.

Important business rules:

- `Comic.slug` must be unique.
- `Chapter` must be unique by `[comicId, chapterNumber]`.
- `ChapterImage` must be unique by `[chapterId, order]`.
- `History` stores reading progress by user and comic.
- `RefreshToken` is stored in DB and can be revoked.
- Images are not stored in DB as binary data. Store only `url`, `key`, metadata, and order.
- Paid chapter access is determined by `Chapter.price` and `Purchase`.

---

# 6. Backend Authentication Contract

Authentication must use JWT.

No cookie auth.

## Register

`POST /auth/register`

Rules:
- Creates user only.
- Does not create access token.
- Does not create refresh token.
- Does not set cookies.

## Login

`POST /auth/login`

Rules:
- Validates email/password.
- Returns `accessToken` and `refreshToken` in JSON.
- Stores refresh token in `RefreshToken` table.
- Does not set cookies.

## Access Protected APIs

Use header:

```txt
Authorization: Bearer <accessToken>
```

## Refresh Access Token

`POST /auth/refresh`

Use header:

```txt
Authorization: Bearer <refreshToken>
```

Rules:
- Do not create a new refresh token.
- Do not revoke the old refresh token.
- Only create a new access token.
- Return only the new access token and current user.

## Logout

`POST /auth/logout`

Use header:

```txt
Authorization: Bearer <refreshToken>
```

Rules:
- Revoke refresh token in DB by setting `isRevoked = true`.
- Do not use cookies.

Current auth contract must be preserved:

```txt
POST /auth/register
- body: name, email, password
- returns user only
- no token

POST /auth/login
- body: email, password
- returns user, accessToken, refreshToken

GET /auth/me
- header: Authorization: Bearer <accessToken>
- returns current user

POST /auth/refresh
- header: Authorization: Bearer <refreshToken>
- returns new accessToken only
- does not rotate refreshToken

POST /auth/logout
- header: Authorization: Bearer <refreshToken>
- revokes refreshToken
```

---

# 7. Backend API Response Standard

All backend APIs must use a consistent response format.

Success response:

```ts
export type ApiSuccessResponse<T> = {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
};
```

Error response:

```ts
export type ApiErrorResponse = {
  success: false;
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  details?: unknown;
};
```

Rules:
- Global response interceptor wraps success responses.
- Global HTTP exception filter wraps errors.
- Controllers should not manually wrap all responses unless there is a specific reason.
- Return data and let the global interceptor standardize it.

---

# 8. Backend Coding Rules

## General

- Use TypeScript strictly.
- Do not use `any`.
- Prefer `unknown` for unknown values.
- Do not use mock data in production code.
- Do not hardcode database records.
- Do not return password fields.
- Always use DTOs for request body validation.
- Always use `class-validator` and `class-transformer`.
- Always protect admin APIs using `JwtAuthGuard` and `AdminGuard`.
- Always clear Redis cache when admin changes comics/chapters/categories/authors.
- Always use `ParseIntPipe` for numeric route params.
- Use `prisma.$transaction` when writing multiple related records.
- Throw NestJS exceptions or map domain/application errors to NestJS exceptions.

## Forbidden

- Cookie auth
- Mock fallback data
- Raw Prisma calls in controllers
- Business logic in controllers
- Password in responses
- `any`
- Duplicated modules/routes
- Prisma schema changes without explicit instruction

---

# 9. Redis Rules

Redis is used for:

- Public comic list cache
- Latest comics cache
- Hot comics cache
- Comic detail cache
- Free chapter detail cache
- Search cache
- Category/author listing cache
- View count buffering later

Cache keys:

```txt
comics:all
comics:latest
comics:hot
comics:detail:{slug}
comics:chapter:{slug}:{chapterNumber}
categories:all
categories:{slug}:comics:{queryString}
authors:{slug}:comics:{queryString}
search:comics:{queryString}
```

When admin updates/deletes a comic, author, category, or chapter, clear relevant keys:

```txt
comics:all
comics:latest
comics:hot
comics:detail:{slug}
comics:chapter:{slug}:*
categories:all
categories:*:comics:*
authors:*:comics:*
search:comics:*
```

Do not cache admin APIs.

---

# 10. Paid Chapter Rules

Free chapter:
- Can be cached publicly.
- Can return images from public endpoint.
- Can use Redis cache and Next.js revalidate.

Paid chapter:
- Must not expose images publicly unless user has access.
- Must verify purchase before returning protected images.
- Requests that include user access checks must use `Authorization` header and no public cache.
- Metadata can be cached if it does not include protected image URLs.
- Images should ideally be private/signed URLs if real payment protection is required.

When chapter changes:

```txt
paid → free:
- Clear backend Redis cache.
- Next public request can cache free response again.

free → paid:
- Clear backend Redis cache immediately.
- This is security-sensitive.
- Make sure no old cached response still contains images.
```

---

# 11. Public Backend API Requirements

Public comic APIs:

```txt
GET /comics
GET /comics/latest
GET /comics/hot
GET /comics/:slug
GET /comics/:slug/chapters/:chapterNumber
GET /search
GET /categories
GET /categories/:slug/comics
GET /authors/:slug/comics
```

Public APIs must only return records where:

```txt
isPublic = true
```

Chapter images must be ordered by:

```txt
order ASC
```

Comic chapters should be ordered by:

```txt
chapterNumber DESC
```

Reader response should include:

```json
{
  "comic": {},
  "chapter": {},
  "images": [],
  "navigation": {
    "previousChapter": null,
    "nextChapter": null
  }
}
```

Search/list responses should use:

```json
{
  "items": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

---

# 12. Admin Backend API Requirements

Admin APIs require:

```txt
Authorization: Bearer <accessToken>
Role: ADMIN
```

Admin comic APIs:

```txt
GET    /admin/comics
POST   /admin/comics
PATCH  /admin/comics/:id
DELETE /admin/comics/:id
```

Admin author APIs:

```txt
GET    /admin/authors
POST   /admin/authors
PATCH  /admin/authors/:id
DELETE /admin/authors/:id
```

Admin category APIs:

```txt
GET    /admin/categories
POST   /admin/categories
PATCH  /admin/categories/:id
DELETE /admin/categories/:id
```

Admin chapter APIs:

```txt
GET    /admin/comics/:comicId/chapters
POST   /admin/comics/:comicId/chapters
GET    /admin/chapters/:id
PATCH  /admin/chapters/:id
DELETE /admin/chapters/:id
```

Admin upload API:

```txt
POST /admin/upload/presigned-urls
```

Admin chapter creation/update must support image list:

```json
{
  "name": "Chapter 1",
  "chapterNumber": 1,
  "price": 0,
  "isPublic": true,
  "images": [
    {
      "url": "https://cdn.example.com/001.webp",
      "key": "comics/one-piece/chapters/1/001-001.webp",
      "order": 1,
      "width": 900,
      "height": 1300,
      "size": 123456,
      "mimeType": "image/webp"
    }
  ]
}
```

---

# 13. Object Storage Rules

Use S3-compatible object storage.

Recommended providers:
- Cloudflare R2
- AWS S3
- MinIO for local development

Do not upload chapter images through the backend as large binary files unless explicitly asked.

Preferred upload flow:

```txt
1. FE asks BE for presigned upload URLs.
2. BE returns upload URLs and object keys.
3. FE uploads images directly to Object Storage.
4. FE sends uploaded image metadata to BE.
5. BE saves image metadata to PostgreSQL through Admin Chapter API.
```

Object key format:

```txt
comics/{comicSlug}/chapters/{chapterNumber}/{paddedOrder}-{safeFileName}
```

Example:

```txt
comics/one-piece/chapters/1/001-001.webp
```

---

# 14. Frontend Feature-Based Architecture

Frontend must use **feature-based architecture**, not frontend layer-first architecture.

Frontend structure:

```txt
fe/src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── truyen/
│   ├── the-loai/
│   ├── tim-kiem/
│   ├── login/
│   ├── register/
│   └── admin/
├── shared/
│   ├── api/
│   │   ├── api-response.schema.ts
│   │   ├── server-api.ts
│   │   ├── client-api.ts
│   │   └── endpoints.ts
│   ├── auth/
│   │   ├── token-storage.ts
│   │   └── auth-client.ts
│   ├── config/
│   │   └── env.ts
│   └── ui/
├── features/
│   ├── comics/
│   │   ├── api/
│   │   │   ├── comics.api.ts
│   │   │   └── comics.schema.ts
│   │   ├── ui/
│   │   │   ├── ComicCard.tsx
│   │   │   ├── ComicGrid.tsx
│   │   │   └── ChapterList.tsx
│   │   └── index.ts
│   ├── reader/
│   │   ├── api/
│   │   │   ├── reader.api.ts
│   │   │   └── reader.schema.ts
│   │   ├── ui/
│   │   │   ├── ReaderImageList.tsx
│   │   │   └── ReaderNavigation.tsx
│   │   └── index.ts
│   ├── search/
│   │   ├── api/
│   │   │   ├── search.api.ts
│   │   │   └── search.schema.ts
│   │   └── index.ts
│   ├── categories/
│   │   ├── api/
│   │   │   ├── categories.api.ts
│   │   │   └── categories.schema.ts
│   │   └── index.ts
│   ├── authors/
│   │   ├── api/
│   │   │   ├── authors.api.ts
│   │   │   └── authors.schema.ts
│   │   └── index.ts
│   ├── auth/
│   │   ├── api/
│   │   ├── model/
│   │   ├── ui/
│   │   └── index.ts
│   └── admin/
│       ├── comics/
│       ├── authors/
│       ├── categories/
│       ├── chapters/
│       └── upload/
├── widgets/
│   ├── site-header/
│   │   ├── SiteHeader.tsx
│   │   └── index.ts
│   └── site-footer/
│       ├── SiteFooter.tsx
│       └── index.ts
└── components/
    └── ui/
```

Rules:
- `app/` contains Next.js routes only.
- `shared/` contains cross-feature infrastructure and utilities.
- `features/` contains business features.
- `widgets/` contains composed layout blocks.
- `components/ui/` contains shadcn/ui generated components.
- Do not move shadcn/ui unless explicitly requested.
- Do not create frontend `domain/`, `application/`, `infrastructure/`, `interface/` layer-first folders for new FE work.

---

# 15. Frontend Zod-First Rules

Frontend must use Zod schemas as the source of truth for API response shapes and derived types.

Use:

```txt
schema first → z.infer<typeof schema> type
```

Do not manually duplicate domain types when they can be inferred from Zod.

Example:

```ts
export const comicSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

export type Comic = z.infer<typeof comicSchema>;
```

Allowed:
- `z.infer`
- Zod object schemas
- Zod enums
- Zod nullable/optional fields
- shared schemas reused across features

Forbidden:
- Manual duplicate types for API data if a Zod schema already exists.
- `any`
- Parsing backend response without validation for important API calls.

---

# 16. Frontend Shared API Rules

Use `fetch`, not Axios, unless explicitly requested.

Create/use:

```txt
fe/src/shared/api/
├── api-response.schema.ts
├── server-api.ts
├── client-api.ts
└── endpoints.ts
```

## api-response.schema.ts

Must include:

- `apiSuccessResponseSchema<TSchema extends z.ZodTypeAny>(dataSchema: TSchema)`
- `apiErrorResponseSchema`
- `paginationMetaSchema`
- `paginatedDataSchema<TSchema extends z.ZodTypeAny>(itemSchema: TSchema)`

Do not use `any`.

## server-api.ts

Used only in Server Components and public feature API functions.

Rules:
- Use Next.js enhanced `fetch`.
- Support `next: { revalidate, tags }`.
- Default public revalidate: 60 seconds.
- Do not send Authorization header.
- Do not use for auth/admin APIs.
- Parse full backend response with Zod.
- Return parsed `data`.
- Throw clear errors.

Function style:

```ts
serverApiGet<TSchema extends z.ZodTypeAny>(
  path: string,
  schema: TSchema,
  options?: {
    revalidate?: number;
    tags?: string[];
    query?: Record<string, string | number | boolean | undefined | null>;
  },
): Promise<z.infer<TSchema>>
```

## client-api.ts

Used in Client Components, auth, admin services, and mutations.

Rules:
- Use normal `fetch`.
- Use `cache: "no-store"`.
- Parse response with Zod.
- Attach `Authorization: Bearer <accessToken>` when `auth: true`.
- If a protected request gets 401:
  - call internal `/api/auth/refresh`
  - save the new access token in RAM
  - retry original request once
  - if refresh fails, clear the access token and throw error
- Browser client must not read refresh tokens.
- The Next.js refresh route handler reads the HttpOnly cookie and calls backend `/auth/refresh` with `Authorization: Bearer <refreshToken>`.
- Do not use `any`.

---

# 17. Frontend Auth Rules

Use:

```txt
fe/src/shared/auth/
├── token-storage.ts
└── auth-client.ts
```

Token storage:
- Do not use localStorage for tokens.
- Store only the access token in module memory.
- The refresh token is stored in an HttpOnly cookie by Next.js Route Handlers.
- Browser client code must not read the refresh token.
- Functions:
  - `getAccessToken(): string | null`
  - `setAccessToken(accessToken: string): void`
  - `clearAccessToken(): void`
  - `hasAccessToken(): boolean`

Auth client:
- `refreshAccessToken(): Promise<string>`
- `logoutClientSide(): void`

Rules:
- Login calls internal `/api/auth/login`; the route handler stores refreshToken in an HttpOnly cookie and returns only user plus accessToken.
- Refresh calls internal `/api/auth/refresh`; the route handler sends the cookie refreshToken to the backend as an Authorization header.
- Refresh stores only the new accessToken in RAM.
- Logout calls internal `/api/auth/logout`; the route handler revokes refreshToken on the backend and clears the cookie.
- Backend auth contract remains header-only and does not set cookies.

---

# 18. Frontend Feature API Rules

Feature API files must call shared API wrappers.

Public feature APIs:
- Use `serverApiGet`.
- Can use Next.js cache/revalidate.
- Must not read localStorage.
- Must not send Authorization.

Admin/auth feature APIs:
- Use `clientApi*`.
- Must use `auth: true` for protected APIs.
- Must use no-store.
- Must not use public cache.

Required feature APIs:

```txt
features/comics/api/comics.api.ts
features/reader/api/reader.api.ts
features/search/api/search.api.ts
features/categories/api/categories.api.ts
features/authors/api/authors.api.ts
```

---

# 19. Frontend Cache Rules

Public pages should use Server Components and cached fetch:

```txt
/                              revalidate 60
/truyen                        revalidate 60
/truyen/[slug]                 revalidate 60
/truyen/[slug]/chapter/[n]     free chapters can revalidate 120
/the-loai/[slug]               revalidate 60
/tim-kiem                      revalidate 30 or no-store if needed
```

Protected or user-specific data must never use public cache.

Never cache requests that include:

```txt
Authorization: Bearer <token>
```

Paid chapter rules:
- Free chapter content can be cached.
- Paid chapter metadata can be cached if it does not include protected images.
- Paid chapter images must not be publicly cached.
- Paid chapter reader requests that require purchase verification must use `cache: "no-store"` and Authorization header.

---

# 20. Frontend Page Rules

Required public routes:

```txt
/
 /truyen
 /truyen/[slug]
 /truyen/[slug]/chapter/[chapterNumber]
 /the-loai/[slug]
 /tim-kiem
 /login
 /register
 /admin
```

Public pages:
- Prefer Server Components.
- Call feature API functions, not raw fetch directly.
- Do not contain mock data.
- Handle empty states.
- Use semantic HTML where possible.
- Use metadata generation for SEO where useful.

Reader page:
- Render chapter images in `order ASC`.
- Support previous/next chapter navigation.
- Show locked state if chapter is paid and images are not available.
- Be mobile-first.
- Do not public-cache paid protected images.

Admin pages:
- Use Client Components where forms/mutations are needed.
- Use admin feature APIs with `auth: true`.
- Must not cache admin data publicly.

---

# 21. Frontend UI Rules

Use:
- Tailwind CSS
- shadcn/ui
- lucide-react if icons are needed
- React Hook Form + Zod for forms

Rules:
- Mobile-first.
- Clean manga/comic style.
- Avoid too much text.
- Grid responsive:
  - mobile: 2 columns
  - tablet: 3 columns
  - desktop: 5 or 6 columns
- Use loading and empty states.
- Do not over-engineer animation.
- Do not block public pages on auth.

---

# 22. Environment Variables

Backend `.env`:

```env
DATABASE_URL="postgresql://postgres:abc130204@localhost:5432/manga_db?schema=public"
REDIS_URL="redis://localhost:6379"

JWT_ACCESS_SECRET="CHANGE_ME_ACCESS_SECRET_AT_LEAST_32_CHARS"
JWT_REFRESH_SECRET="CHANGE_ME_REFRESH_SECRET_AT_LEAST_32_CHARS"

PORT=4000

S3_ENDPOINT=""
S3_REGION="auto"
S3_BUCKET=""
S3_ACCESS_KEY_ID=""
S3_SECRET_ACCESS_KEY=""
S3_PUBLIC_URL=""
S3_FORCE_PATH_STYLE="true"
```

Frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

---

# 23. Docker

Local Docker services:

```yaml
services:
  postgres:
    image: postgres:15-alpine
    container_name: manga_postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: abc130204
      POSTGRES_DB: manga_db
    ports:
      - '5432:5432'
    volumes:
      - manga_postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: manga_redis
    restart: always
    ports:
      - '6379:6379'

volumes:
  manga_postgres_data:
```

---

# 24. Commands

Backend:

```bash
cd be
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

Prisma:

```bash
npx prisma studio
npx prisma migrate dev --name init
npx prisma generate
```

Docker:

```bash
docker compose up -d
docker ps
docker exec -it manga_redis redis-cli
```

Frontend:

```bash
cd fe
npm install
npm run dev
npm run lint
npm run build
```

Check no `any`:

```bash
rg "\bany\b" src
```

---

# 25. Codex Rules

When asked to code:

1. Read this `SKILL.md` first.
2. Inspect existing files before editing.
3. Do not duplicate modules.
4. Do not rename existing files unless necessary.
5. Do not change Prisma schema unless explicitly asked.
6. Do not remove existing working APIs.
7. Follow API response standard.
8. Use guards for protected backend APIs.
9. Backend APIs use `Authorization: Bearer <token>` only.
10. Frontend may use HttpOnly refresh-token cookies only through Next.js Route Handlers; backend must not implement cookie auth.
11. Do not return password fields.
12. Do not use mock data.
13. Do not use `any`.
14. Keep code production-style and maintainable.
15. Backend: prefer Clean Architecture for new features.
16. Frontend: use feature-based architecture, not layer-first architecture.
17. Frontend: use Zod-first schemas and `z.infer`.
18. Do not force a big rewrite of existing working code unless explicitly asked.
19. After coding, list changed files and test commands.

---

# 26. Definition of Done

A task is complete only when:

- TypeScript compiles.
- No `any` is introduced.
- Backend DTO validation exists for request bodies.
- Protected backend routes have guards.
- Backend API response follows the standard format.
- No password is returned.
- Redis cache is invalidated after admin mutations.
- Existing API behavior is not broken.
- Frontend uses shared API wrappers, not raw repeated fetch in components.
- Frontend uses feature API functions from `features/*/api`.
- Frontend Zod schemas validate important backend responses.
- Public frontend pages use server fetch caching when appropriate.
- Protected frontend requests use no-store and Authorization header.
- The final answer includes:
  - changed files
  - commands run
  - build/test/lint result
  - endpoints/routes to test
