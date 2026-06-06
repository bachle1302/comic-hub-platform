# Phase 1 System Settings Result

## Files Changed

- `docs/optimization/PHASE_1_SYSTEM_SETTINGS_PLAN.md`
- `docs/optimization/PHASE_1_SYSTEM_SETTINGS_RESULT.md`
- `src/features/system-settings/api/public-system-settings.client-api.ts`
- `src/features/system-settings/model/PublicSettingsProvider.tsx`
- `src/features/system-settings/ui/MaintenanceGate.tsx`
- `src/features/system-settings/index.ts`
- `src/widgets/site-footer/SiteFooter.tsx`
- `src/app/providers.tsx`
- `src/app/maintenance/page.tsx`
- `src/app/lien-he/page.tsx`

## Removed Duplicate Requests

Before this phase, public pages could trigger separate client calls from both:

- `MaintenanceGate`
- `SiteFooter`

Now those two components read the same `PublicSettingsProvider` context. The only client fetch path is `getPublicSystemSettingsClientSafe()`, which now has:

- an in-flight promise to coalesce simultaneous callers
- a short 60-second memory cache
- a safe `{}` fallback when the backend is unavailable

Direct `/system-settings/public` references are now intentionally centralized in:

- `src/proxy.ts` for the maintenance gate before render
- `src/features/system-settings/api/system-settings.api.ts` for server-side reads
- `src/features/system-settings/api/public-system-settings.client-api.ts` for client provider/cache reads

## Maintenance Flow

`src/proxy.ts` remains the primary maintenance blocker. It checks `/system-settings/public` before rendering public pages and rewrites public traffic to `/maintenance` when maintenance mode is enabled.

`MaintenanceGate` no longer fetches settings by itself. It only reads provider settings as a client-side fallback. Admin, login, API, and maintenance routes still bypass the gate.

## Footer Settings Flow

`SiteFooter` no longer calls `/system-settings/public` directly. It reads the public settings context and keeps existing fallback values for site name, description, support email, and social links until settings are loaded.

Admin routes still hide the footer.

## Build ECONNREFUSED Reduction

`/maintenance` and `/lien-he` now export:

```ts
export const dynamic = "force-dynamic";
```

They still use `getPublicSystemSettingsSafe()` at runtime, so they keep a safe fallback if the backend is unavailable. This prevents those pages from requiring the backend during static generation.

The current `npm run build` completed without `ECONNREFUSED` output.

## DevTools Network Check

After deploy or local production build:

1. Open DevTools Network.
2. Load a public page such as `/`.
3. Filter for `system-settings/public`.
4. Expected client behavior: at most one browser-side request from the public settings provider within the 60-second cache window.
5. `proxy.ts` may still call the backend server-side for public route maintenance checks; that is intentional and will not appear as a browser fetch.
6. Navigate between public routes; footer and maintenance gate should not create separate duplicate settings requests.

## Risks / Notes

- Client public settings are cached for 60 seconds, so footer contact/social changes may take up to one minute to refresh in an already-open tab unless `reload()` is called.
- `proxy.ts` still checks maintenance per public request by design. Reducing that further would require backend/edge cache strategy and is outside phase 1.
- `sitemap.ts` and public list/grid prefetch were intentionally not changed in this phase.

## Verification

- `npm run format`: failed because the frontend package has no `format` script.
- `npm run lint`: pass.
- `npm run build`: pass.
- `rg "\bany\b" src`: no matches.
- `rg "localStorage|getRefreshToken|setTokens|clearTokens" src`: no matches.
- `rg "/system-settings/public" src`: 3 intentional centralized references.
