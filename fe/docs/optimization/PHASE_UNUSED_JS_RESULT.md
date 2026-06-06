# Phase Unused JavaScript Result

## Files Changed

- `docs/optimization/PHASE_UNUSED_JS_AUDIT.md`
- `docs/optimization/PHASE_UNUSED_JS_RESULT.md`
- `src/app/layout.tsx`
- `src/app/providers.tsx`
- `src/features/auth/ui/GoogleLoginButton.tsx`
- `src/features/notifications/model/notification-realtime.tsx`
- `src/widgets/site-header/SiteHeader.tsx`

## What Changed

### Google GSI no longer loads globally

`GoogleOAuthProvider` was removed from `src/app/providers.tsx`.

It is now scoped to `GoogleLoginButton`, so Google Identity Services should only be loaded when the login UI renders instead of on the homepage/public initial load.

Remaining Google-related source references are expected:

- `src/features/auth/ui/GoogleLoginButton.tsx`
- auth schema/API names for Google login
- `/api/auth/google` route handler
- privacy policy text

### Header user-only widgets are lazy loaded

`SiteHeader` now lazy loads:

- `NotificationBell`
- `WalletBadge`

These components are only rendered after auth is ready and the user is authenticated, so anonymous public pages avoid paying for their code in the initial header bundle.

### Socket.IO client is no longer imported on anonymous initial load

`NotificationRealtimeProvider` still exists globally to preserve realtime behavior, but it now dynamically imports `@/shared/realtime/socket` only after:

- route is not admin
- auth is done loading
- user is authenticated
- an access token exists in RAM

This keeps `socket.io-client` out of the anonymous public initial path.

### Public root imports are more direct

Root/header imports were changed away from broad feature barrels where they could pull unrelated exports:

- `AnnouncementBannerList` is imported directly from its UI file.
- `AuthProvider` is imported directly from `auth-store`.
- `NotificationRealtimeProvider` is imported directly from its model file.
- Header imports `useAuth` and `LogoutButton` directly.

## Verification Commands

- `npm run lint`: pass.
- `npm run build`: pass.
- `rg "\bany\b" src`: no matches.
- `rg "localStorage|getRefreshToken|setTokens|clearTokens" src`: no matches.
- `rg "accounts.google.com/gsi/client|gsi/client|Google" src`: Google remains only in login/auth/privacy-policy related source, not global providers.

Additional checks:

- `rg '@react-oauth/google|GoogleOAuthProvider|GoogleLogin' src\app src\widgets`: only `/api/auth/google` route text remains under `src/app`; no global provider/widget import.
- `rg 'socket.io-client|connectNotificationSocket' src\app src\widgets src\features\notifications src\shared\realtime`: `socket.io-client` remains only in `src/shared/realtime/socket.ts`, loaded through dynamic import after login.

## Expected Lighthouse Impact

- The third-party `accounts.google.com/gsi/client` warning should disappear from anonymous homepage/public page initial load.
- First-party unused JS should drop because notification/wallet/socket code no longer sits in the anonymous header/root path.

## Remaining Risks

- `AuthProvider` still runs globally by design to restore RAM access token after reload. This is required by the current auth flow.
- `AnnouncementBannerList` still lives in root layout and can fetch announcements on public routes. This phase only reduced barrel import risk, not banner behavior.
- Exact chunk names in production may differ after build/deploy, so Lighthouse should be rerun against the deployed production bundle.
