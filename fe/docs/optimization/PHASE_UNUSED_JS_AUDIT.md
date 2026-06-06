# Phase Unused JavaScript Audit

## Lighthouse Input

Ignored:

- Chrome extension `contentScript.js` savings, because it is not project source code.

First-party chunks reported on production:

- `chunks/127~1_sr-qbg7.js`: 130.8 KiB transfer, 74.5 KiB estimated savings.
- `chunks/0a7y9cgt~2-7g.js`: 61.5 KiB transfer, 49.5 KiB estimated savings.
- `chunks/0slp24g-o~.op.js`: 30.1 KiB transfer, 21.8 KiB estimated savings.

Third-party:

- `https://accounts.google.com/gsi/client`: 93.4 KiB transfer, 77.9 KiB estimated savings.

## Findings

### 1. Google GSI is loaded globally

**Problem**

`src/app/providers.tsx` wraps the whole application with `GoogleOAuthProvider` when `GOOGLE_CLIENT_ID` exists. That makes the Google Identity Services script eligible to load on public initial pages, even when the user is not on `/login`.

**Related files**

- `src/app/providers.tsx`
- `src/features/auth/ui/GoogleLoginButton.tsx`
- `src/features/auth/ui/LoginForm.tsx`

**Impact**

High. This directly matches Lighthouse's `accounts.google.com/gsi/client` unused JavaScript warning on public pages.

**Suggested fix**

Move `GoogleOAuthProvider` from global app providers into `GoogleLoginButton`, so GSI loads only on the login UI.

**Fix now**

Yes. Low risk and directly targeted.

### 2. Public root imports feature barrels that export heavier client code

**Problem**

Root/public files import from feature barrels:

- `src/app/layout.tsx` imports `AnnouncementBannerList` from `@/features/announcements`.
- `src/app/providers.tsx` imports `NotificationRealtimeProvider` from `@/features/notifications`.
- `src/widgets/site-header/SiteHeader.tsx` imports auth, notifications, and wallet from feature barrels.

Those barrels export more than the root actually needs, including admin announcement components, notification UI/API, auth forms, and Google login components. Turbopack can tree-shake some of this, but barrel imports in Client Components are still a common source of bigger client chunks.

**Related files**

- `src/app/layout.tsx`
- `src/app/providers.tsx`
- `src/widgets/site-header/SiteHeader.tsx`
- `src/features/auth/index.ts`
- `src/features/notifications/index.ts`
- `src/features/wallet/index.ts`
- `src/features/announcements/index.ts`

**Impact**

Medium to high. This is a plausible source for the first-party chunks reported by Lighthouse, especially on the homepage where admin/auth/notification UI is mostly unused.

**Suggested fix**

Use direct file imports in root/header instead of broad feature barrels.

**Fix now**

Yes. Low risk.

### 3. Notification realtime imports `socket.io-client` in the global provider path

**Problem**

`NotificationRealtimeProvider` is mounted globally and statically imports `connectNotificationSocket`, which statically imports `socket.io-client`. Public anonymous users do not need Socket.IO on initial load.

**Related files**

- `src/app/providers.tsx`
- `src/features/notifications/model/notification-realtime.tsx`
- `src/shared/realtime/socket.ts`

**Impact**

High for first-party unused JavaScript. `socket.io-client` is a likely contributor to a larger client chunk.

**Suggested fix**

Keep the provider global for behavior, but dynamically import `@/shared/realtime/socket` only after auth is ready and the user is authenticated.

**Fix now**

Yes. Low risk if cleanup handles async import correctly.

### 4. Header imports user-only widgets on public pages

**Problem**

`SiteHeader` is a Client Component rendered on public routes. It imports:

- `NotificationBell`
- `WalletBadge`
- `LogoutButton`

These are only useful after login. Anonymous homepage users should not pay for notification/wallet code in the initial header chunk.

**Related files**

- `src/widgets/site-header/SiteHeader.tsx`
- `src/features/notifications/ui/NotificationBell.tsx`
- `src/features/wallet/ui/WalletBadge.tsx`
- `src/features/auth/ui/LogoutButton.tsx`

**Impact**

Medium. Notification bell also imports dropdown/API/realtime context; wallet imports wallet API.

**Suggested fix**

Lazy load `NotificationBell` and `WalletBadge` with `next/dynamic` and direct component paths. Keep logout direct unless build shows it is large.

**Fix now**

Yes for `NotificationBell` and `WalletBadge`. Keep logout direct to avoid over-optimizing.

### 5. Announcement banner remains global

**Problem**

`AnnouncementBannerList` runs in root layout and fetches announcements on public routes. This is more of a request concern than a JavaScript-size concern. However, importing it through the announcements barrel can expose admin announcement exports to the root path.

**Related files**

- `src/app/layout.tsx`
- `src/features/announcements/index.ts`
- `src/features/announcements/ui/AnnouncementBannerList.tsx`

**Impact**

Low to medium.

**Suggested fix**

Only change the import to direct component path. Do not remove or lazy-load the banner in this phase.

**Fix now**

Yes, direct import only.

## Changes Approved For This Phase

1. Move Google OAuth provider from global `providers.tsx` to `GoogleLoginButton`.
2. Replace root/header feature barrel imports with direct file imports where they affect public initial load.
3. Dynamic import `socket.io-client` path only after authenticated user exists.
4. Lazy load `NotificationBell` and `WalletBadge` in `SiteHeader`.

## Out Of Scope

- Public comic grid/list prefetch.
- SEO-critical homepage content lazy loading.
- Admin bundle optimization.
- Removing auth provider from root layout.
- Replacing announcement behavior.
