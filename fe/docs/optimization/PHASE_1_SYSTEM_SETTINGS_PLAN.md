# Phase 1 System Settings Plan

## Strategy

Keep `src/proxy.ts` as the primary maintenance-mode blocker. The proxy can stop public routes before React renders, so the client layer should not make a second independent maintenance check.

Add a lightweight client-side public settings provider and cache:

- `PublicSettingsProvider` fetches public settings once for non-admin client pages.
- `MaintenanceGate` reads settings from the provider and acts only as a fallback UI if maintenance is detected after hydration.
- `SiteFooter` reads the same provider settings instead of fetching `/system-settings/public` separately.
- The client API helper keeps a short in-memory cache and in-flight promise so accidental duplicate calls are coalesced.

## Build ECONNREFUSED Handling

`/maintenance` and `/lien-he` need settings at runtime, not at build time. Mark these pages as `force-dynamic` and keep their existing safe fallback so `next build` does not depend on the backend being online.

## Files Planned

- `src/features/system-settings/api/public-system-settings.client-api.ts`
- `src/features/system-settings/model/PublicSettingsProvider.tsx`
- `src/features/system-settings/ui/MaintenanceGate.tsx`
- `src/widgets/site-footer/SiteFooter.tsx`
- `src/app/providers.tsx`
- `src/app/maintenance/page.tsx`
- `src/app/lien-he/page.tsx`
- `src/features/system-settings/index.ts`

## Out Of Scope

- Public list/grid prefetch changes.
- Global route cache cleanup.
- Admin prefetch changes.
- Sitemap optimization.
