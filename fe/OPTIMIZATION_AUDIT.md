# Next.js Optimization Audit

Phạm vi rà soát: toàn bộ `fe/src`, tập trung vào Next.js Link prefetch, fetch lúc build, API call lặp, Server/Client Component render thừa và route cache/dynamic.

Ngày audit: 2026-06-06.

## Tóm Tắt

- Admin prefetch đã được tắt bằng `AdminLink`; hiện không còn `next/link` trong `src/app/admin`, `src/features/admin`, `src/widgets/admin-sidebar`.
- Public site vẫn còn nhiều `Link` mặc định prefetch. Phần lớn nên giữ vì cải thiện UX, nhưng một số list dài nên cân nhắc tắt.
- Có nhiều nguồn gọi `/system-settings/public`: `proxy.ts`, `MaintenanceGate`, `SiteFooter`, server page `/maintenance`, server page `/lien-he`. Đây là cụm request đáng tối ưu nhất.
- `next build` có thể in `TypeError: fetch failed ECONNREFUSED` dù exit code 0. Nguồn nghi vấn cao nhất là các Server Component/static route gọi backend lúc build: `/maintenance`, `/lien-he`, `/sitemap.xml`; cũng cần kiểm tra Sentry `withSentryConfig` hook vì log build có `runAfterProductionCompile`.
- Một số route public đang khai báo đồng thời `dynamic = "force-dynamic"` và `revalidate`, làm intent cache không rõ ràng.

## Kiểm Tra Link Prefetch

Lệnh đã dùng:

```bash
rg -n "next/link" src
rg -n "<Link" src
rg -n "from \"next/link\"" src/app/admin src/features/admin src/widgets/admin-sidebar
rg -n "<Link" src/app/admin src/features/admin src/widgets/admin-sidebar
```

Kết quả admin:

- `src/app/admin`, `src/features/admin`, `src/widgets/admin-sidebar`: không còn `next/link` hoặc `<Link>`.
- Các link admin liên quan ở `features/announcements` và `features/contact-tickets` đã dùng `AdminLink`.

Kết quả public còn `next/link`:

- `src/widgets/site-header/SiteHeader.tsx`
- `src/widgets/site-footer/SiteFooter.tsx`
- `src/features/comics/ui/ComicCard.tsx`
- `src/features/comics/ui/ChapterList.tsx`
- `src/features/rankings/ui/RankingComicList.tsx`
- `src/features/follows/ui/FollowedComicsList.tsx`
- `src/features/histories/ui/HistoryList.tsx`
- `src/features/reader/ui/ReaderNavigation.tsx`
- `src/features/notifications/ui/NotificationDropdown.tsx`
- Auth/legal/error/maintenance pages
- `src/app/page.tsx`, `src/app/bang-xep-hang/page.tsx`, `src/app/truyen/[slug]/page.tsx`

## Findings

### 1. Public list/grid links có thể prefetch nhiều route chi tiết

**Vấn đề**

`ComicCard`, `RankingComicList`, `ChapterList`, `HistoryList`, `FollowedComicsList` render nhiều `<Link>` trong danh sách. Ở production, Next.js có thể prefetch route khi link vào viewport. Với list 20 item, browser có thể tạo nhiều request `?_rsc=...` tới comic/chapter detail.

**File liên quan**

- `src/features/comics/ui/ComicCard.tsx`
- `src/features/rankings/ui/RankingComicList.tsx`
- `src/features/comics/ui/ChapterList.tsx`
- `src/features/histories/ui/HistoryList.tsx`
- `src/features/follows/ui/FollowedComicsList.tsx`

**Mức độ ảnh hưởng**

Trung bình đến cao trên trang có nhiều item. Đặc biệt ranking, comic grid, followed/history list có thể prefetch nhiều detail route không được click.

**Cách sửa đề xuất**

Tạo `NoPrefetchLink` hoặc dùng trực tiếp `prefetch={false}` cho link trong list/grid dài. Giữ prefetch cho navigation chính như header/footer nếu muốn UX nhanh.

Ưu tiên tắt:

- Thumbnail/title trong `ComicCard`
- Item trong `RankingComicList`
- Chapter rows trong `ChapterList` nếu danh sách dài
- History/follow rows trong user pages

**Có nên sửa ngay không**

Có, nếu production network đang thấy nhiều `?_rsc=` khi chỉ scroll/list. Đây là tối ưu ít rủi ro.

---

### 2. Header/footer public links nên giữ prefetch

**Vấn đề**

`SiteHeader` và `SiteFooter` vẫn dùng Next `<Link>` mặc định.

**File liên quan**

- `src/widgets/site-header/SiteHeader.tsx`
- `src/widgets/site-footer/SiteFooter.tsx`

**Mức độ ảnh hưởng**

Thấp. Số link ít và là navigation chính.

**Cách sửa đề xuất**

Giữ prefetch cho public navigation chính. Chỉ cân nhắc tắt link `/admin` trong `SiteHeader` nếu admin user thấy vẫn sinh prefetch `/admin`.

**Có nên sửa ngay không**

Không bắt buộc. Nếu muốn tuyệt đối giảm request cho admin user trên public site, có thể thêm `prefetch={false}` riêng cho link `/admin`.

---

### 3. `/system-settings/public` đang bị gọi nhiều tầng trên public route

**Vấn đề**

Public route có thể gọi settings nhiều lần:

- `proxy.ts` gọi `/system-settings/public` mỗi request public để kiểm tra maintenance.
- `MaintenanceGate` gọi lại ở browser.
- `SiteFooter` gọi lại ở browser.
- `/maintenance` server page gọi settings.
- `/lien-he` server page gọi settings.

Kết quả: vào một public page có thể có request middleware + client gate + footer. Dù mỗi request nhỏ, đây là request nền lặp không cần thiết.

**File liên quan**

- `src/proxy.ts`
- `src/features/system-settings/ui/MaintenanceGate.tsx`
- `src/widgets/site-footer/SiteFooter.tsx`
- `src/app/maintenance/page.tsx`
- `src/app/lien-he/page.tsx`
- `src/features/system-settings/api/public-system-settings.client-api.ts`
- `src/features/system-settings/api/system-settings.api.ts`

**Mức độ ảnh hưởng**

Cao về request noise. Đây có khả năng là nguồn request dư rõ nhất ngoài Link prefetch.

**Cách sửa đề xuất**

Chọn một nguồn sự thật:

1. Nếu dùng `proxy.ts` để rewrite maintenance, bỏ `MaintenanceGate` client fetch hoặc chỉ để fallback rất nhẹ.
2. Tạo `PublicSettingsProvider` client dùng chung cho `MaintenanceGate` và `SiteFooter`, fetch một lần mỗi route/session thay vì hai lần.
3. Với footer, nếu settings không bắt buộc realtime, có thể render default text và chỉ load settings ở page cấu hình/liên hệ.

**Có nên sửa ngay không**

Có. Nên sửa sau khi thống nhất hướng: middleware-only hoặc provider cache client.

---

### 4. `next build` có `ECONNREFUSED` do fetch lúc build hoặc Sentry hook

**Vấn đề**

Build trước đó hoàn tất nhưng in:

```txt
TypeError: fetch failed
cause: AggregateError
code: ECONNREFUSED
```

Các route static/server có gọi backend trong build nếu backend không chạy:

- `/maintenance` gọi `getPublicSystemSettingsSafe()`
- `/lien-he` gọi `getPublicSystemSettingsSafe()`
- `/sitemap.xml` gọi `getCategories()`, `getAllComics()`, rồi `getComicDetail()` cho từng comic

Ngoài ra `next.config.ts` dùng `withSentryConfig`, build log có `runAfterProductionCompile`. Nếu `SENTRY_*` env bật một phần, Sentry hook cũng có thể thử network.

**File liên quan**

- `src/app/maintenance/page.tsx`
- `src/app/lien-he/page.tsx`
- `src/app/sitemap.ts`
- `src/shared/api/server-api.ts`
- `next.config.ts`
- `sentry.server.config.ts`
- `sentry.client.config.ts`
- `instrumentation.ts`

**Mức độ ảnh hưởng**

Trung bình. Hiện build exit code 0, nhưng log gây nhiễu và trong CI/Docker có thể khó phân biệt lỗi thật.

**Cách sửa đề xuất**

1. Thêm marker build env, ví dụ `SKIP_BUILD_BACKEND_FETCH=true`, để các page ít quan trọng như `/maintenance`, `/lien-he`, `/sitemap` trả fallback khi build.
2. Hoặc khai báo `export const dynamic = "force-dynamic"` cho `/maintenance` và `/lien-he` nếu không muốn prerender gọi backend.
3. Với `sitemap.ts`, giữ fallback static nhưng cân nhắc giới hạn số comic detail hoặc không gọi detail từng comic ở build.
4. Kiểm tra env Sentry. Nếu không upload sourcemap, có thể chỉ wrap `withSentryConfig` khi `SENTRY_AUTH_TOKEN` tồn tại hoặc đảm bảo plugin không network.

**Có nên sửa ngay không**

Có, nếu build log cần sạch trong Docker/CI. Ưu tiên xử lý `/maintenance`, `/lien-he`, `sitemap.ts` trước; nếu vẫn còn log thì kiểm tra Sentry wrapper.

---

### 5. `sitemap.ts` có thể tạo N+1 request theo số comic

**Vấn đề**

`sitemap.ts` gọi:

```ts
getCategories()
getAllComics()
Promise.allSettled(comics.map((comic) => getComicDetail(comic.slug)))
```

Nếu có 500 comic, sitemap sẽ gọi thêm 500 detail request để lấy chapters.

**File liên quan**

- `src/app/sitemap.ts`

**Mức độ ảnh hưởng**

Cao khi dữ liệu tăng. Có thể làm chậm build/runtime sitemap và gây burst request lên backend.

**Cách sửa đề xuất**

1. Backend nên có public sitemap endpoint trả comic + chapter route data trong một request.
2. Tạm thời: chỉ include comic detail, bỏ chapter routes hoặc giới hạn số comic detail.
3. Nếu vẫn include chapters, dùng concurrency limit nhỏ thay vì `Promise.allSettled` toàn bộ.

**Có nên sửa ngay không**

Có nếu DB đã có nhiều comic/chapter. Nếu dữ liệu ít, có thể để sau nhưng nên ghi technical debt.

---

### 6. Public pages đang dùng đồng thời `dynamic = "force-dynamic"` và `revalidate`

**Vấn đề**

Một số page khai báo cả:

```ts
export const revalidate = ...
export const dynamic = "force-dynamic";
```

Hai ý định này mâu thuẫn ở mức vận hành: `force-dynamic` ép render runtime, còn `revalidate` gợi ý ISR/cache. Điều này làm khó dự đoán request backend và cache.

**File liên quan**

- `src/app/page.tsx`
- `src/app/truyen/page.tsx`
- `src/app/truyen/[slug]/page.tsx`
- `src/app/truyen/[slug]/chapter/[chapterNumber]/page.tsx`
- `src/app/tim-kiem/page.tsx`
- `src/app/the-loai/[slug]/page.tsx`
- `src/app/bang-xep-hang/page.tsx`

**Mức độ ảnh hưởng**

Trung bình. Không nhất thiết gây lỗi, nhưng làm cache strategy thiếu rõ ràng.

**Cách sửa đề xuất**

Chia route theo loại:

- Static/ISR public catalog: bỏ `force-dynamic`, giữ `revalidate`.
- Search/ranking có query thay đổi thường xuyên: dùng `force-dynamic` và bỏ `revalidate`, hoặc dùng `fetchCache = "force-no-store"` nếu muốn luôn fresh.
- Reader paid/free mixed: cân nhắc giữ dynamic cho page, nhưng public free metadata có thể cache ở backend.

**Có nên sửa ngay không**

Có, nhưng nên làm theo từng route và test kỹ SEO/cache. Không nên sửa bừa toàn bộ.

---

### 7. `MaintenanceGate` và `proxy.ts` trùng chức năng maintenance

**Vấn đề**

`proxy.ts` đã kiểm tra maintenance trước khi render page. `MaintenanceGate` lại kiểm tra trong client sau khi page hydrate.

**File liên quan**

- `src/proxy.ts`
- `src/features/system-settings/ui/MaintenanceGate.tsx`
- `src/app/providers.tsx`

**Mức độ ảnh hưởng**

Trung bình. Gây thêm request client và có thể tạo flash page trước khi hiện maintenance.

**Cách sửa đề xuất**

Nếu đã tin `proxy.ts`, bỏ client fetch trong `MaintenanceGate`; `MaintenanceGate` chỉ nên là fallback khi settings đã được truyền sẵn hoặc khi proxy không chạy.

**Có nên sửa ngay không**

Có, cùng nhóm với tối ưu system settings.

---

### 8. `AnnouncementBannerList` gọi API trên mọi public route

**Vấn đề**

`AnnouncementBannerList` nằm trong root layout và gọi `getActiveAnnouncements({ limit: 3 })` trên mọi non-admin route.

**File liên quan**

- `src/app/layout.tsx`
- `src/features/announcements/ui/AnnouncementBannerList.tsx`
- `src/features/announcements/api/announcements.api.ts`

**Mức độ ảnh hưởng**

Trung bình. Đây là request nền hợp lệ nếu site cần banner, nhưng có thể bị xem là dư trên các trang auth/legal/error.

**Cách sửa đề xuất**

1. Bypass thêm các route không cần banner: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, legal pages.
2. Cache client nhẹ theo memory module hoặc provider để chuyển route không fetch lại ngay.
3. Nếu announcements public có thể cache server-side, chuyển sang Server Component trong layout với revalidate.

**Có nên sửa ngay không**

Nên sửa nếu production network cần sạch. Không nguy hiểm nhưng dễ giảm noise.

---

### 9. AuthProvider refresh là request nền toàn app, nhưng đã có session marker

**Vấn đề**

`AuthProvider` chạy trong root providers và gọi refresh/me nếu có auth session marker. Đây là request hợp lệ để khôi phục RAM access token sau reload.

**File liên quan**

- `src/features/auth/model/auth-store.tsx`
- `src/shared/auth/session-marker.ts`
- `src/app/providers.tsx`

**Mức độ ảnh hưởng**

Thấp. Đã có `loadMeInFlight` và session marker nên không gọi khi chưa từng login.

**Cách sửa đề xuất**

Giữ nguyên. Chỉ cần đảm bảo session marker không bị set sai hoặc tồn tại sau logout.

**Có nên sửa ngay không**

Không.

---

### 10. NotificationBell và WalletBadge là request nền khi login

**Vấn đề**

Khi user login và không ở admin:

- `WalletBadge` gọi `/me/wallet`.
- `NotificationBell` gọi `/notifications/unread-count`.

Đây là request hợp lệ nhưng sẽ xảy ra ở mọi public route.

**File liên quan**

- `src/widgets/site-header/SiteHeader.tsx`
- `src/features/wallet/ui/WalletBadge.tsx`
- `src/features/notifications/ui/NotificationBell.tsx`

**Mức độ ảnh hưởng**

Thấp đến trung bình với user đã login.

**Cách sửa đề xuất**

1. Giữ nếu UX cần luôn thấy coin/unread count.
2. Nếu muốn giảm request, cache in-memory ngắn hạn cho wallet/unread count.
3. Hoặc lazy load khi header menu mở trên mobile.

**Có nên sửa ngay không**

Không bắt buộc.

---

### 11. Comments section đã tối ưu batch like status, nhưng vẫn có request nền mỗi comment section

**Vấn đề**

`CommentSection` luôn load comments khi mount. Nếu user login, sau khi comments load sẽ gọi batch like status một lần cho toàn bộ comment/reply ids.

**File liên quan**

- `src/features/comments/ui/CommentSection.tsx`
- `src/features/comments/api/comments.api.ts`
- `src/features/comments/ui/CommentLikeButton.tsx`

**Mức độ ảnh hưởng**

Thấp đến trung bình. Thiết kế hiện tại hợp lý, không còn N+1 per comment nhờ batch endpoint.

**Cách sửa đề xuất**

Giữ. Nếu muốn tối ưu thêm, lazy load comments khi user scroll tới comment section bằng IntersectionObserver.

**Có nên sửa ngay không**

Không bắt buộc.

---

### 12. ComicLikeButton gọi status riêng

**Vấn đề**

`ComicLikeButton` gọi `getComicLikeStatus(comicId)` khi mount. Hiện nút này chủ yếu ở comic detail nên không nghiêm trọng. Nếu sau này đặt nút like vào grid/list, sẽ thành N+1.

**File liên quan**

- `src/features/comics/ui/ComicLikeButton.tsx`
- `src/app/truyen/[slug]/page.tsx`

**Mức độ ảnh hưởng**

Thấp hiện tại.

**Cách sửa đề xuất**

Giữ ở detail. Nếu dùng trong list, cần batch comic like status hoặc chỉ optimistic anonymous count.

**Có nên sửa ngay không**

Không.

---

### 13. Reader paid flow gọi access/protected reader hợp lý nhưng có thể gọi thêm history

**Vấn đề**

`ReaderClientSection`:

- Nếu paid locked + authenticated: gọi `getChapterAccess`, nếu có access gọi `getProtectedChapter`.
- Nếu `continue=1`: gọi `getComicHistory`.
- `SaveReadingProgress` save theo scroll.

Đây là đúng luồng, nhưng khi vào reader paid có thể có 2-3 protected/user requests.

**File liên quan**

- `src/features/reader/ui/ReaderClientSection.tsx`
- `src/features/histories/ui/SaveReadingProgress.tsx`
- `src/features/purchases/api/purchases.api.ts`

**Mức độ ảnh hưởng**

Trung bình nhưng hợp lệ theo nghiệp vụ.

**Cách sửa đề xuất**

1. Backend protected reader có thể trả access + images trong một call; FE bỏ `getChapterAccess` trước nếu endpoint protected reader trả lỗi đủ rõ.
2. Chỉ gọi history khi `continue=1` như hiện tại là đúng.

**Có nên sửa ngay không**

Không bắt buộc; chỉ tối ưu nếu reader paid đang chậm.

---

### 14. Client API GET dedupe chỉ dedupe request đang bay, không cache ngắn hạn

**Vấn đề**

`client-api.ts` dedupe GET bằng `inFlightGetRequests`, nhưng khi request đã xong thì xóa khỏi map. Điều này tránh double-call đồng thời, nhưng không tránh cùng route/component fetch lại khi navigation qua lại nhanh.

**File liên quan**

- `src/shared/api/client-api.ts`

**Mức độ ảnh hưởng**

Trung bình với API global như settings, wallet, notifications, announcements.

**Cách sửa đề xuất**

Thêm optional TTL memory cache cho một số public/client GET an toàn:

- `/system-settings/public`
- `/announcements/active`
- `/notifications/unread-count` ngắn hạn nếu cần

Không áp dụng mặc định cho admin/user-specific data nếu không có invalidation.

**Có nên sửa ngay không**

Nên sửa cho settings/announcements sau khi chọn strategy.

---

### 15. Admin table/detail prefetch đã xử lý

**Vấn đề**

Trước đó Next.js production prefetch tạo nhiều request `?_rsc=...` khi vào `/admin`.

**File liên quan**

- `src/shared/ui/AdminLink.tsx`
- `src/widgets/admin-sidebar/AdminSidebar.tsx`
- `src/app/admin/**`
- `src/features/admin/**`
- `src/features/announcements/ui/AdminAnnouncementsTable.tsx`
- `src/features/contact-tickets/ui/AdminContactTicketsTable.tsx`

**Mức độ ảnh hưởng**

Đã giảm mạnh.

**Cách sửa đề xuất**

Giữ `AdminLink` cho mọi link admin mới. Có thể thêm lint convention/code review rule: admin routes không import trực tiếp `next/link`.

**Có nên sửa ngay không**

Không cần sửa thêm, chỉ duy trì.

## Đề Xuất Thứ Tự Sửa Sau Khi Duyệt

1. Tối ưu system settings/maintenance: bỏ request trùng giữa `proxy`, `MaintenanceGate`, `SiteFooter`.
2. Làm sạch build `ECONNREFUSED`: xử lý `/maintenance`, `/lien-he`, `sitemap.ts`; nếu còn thì kiểm tra Sentry wrapper.
3. Tắt prefetch cho public list/grid dài: `ComicCard`, `RankingComicList`, `ChapterList`, `HistoryList`, `FollowedComicsList`.
4. Chuẩn hóa route cache: bỏ mâu thuẫn `force-dynamic` + `revalidate`.
5. Tối ưu announcements banner nếu vẫn thấy request nền không cần thiết.

## Ghi Chú Không Nên Sửa Vội

- Không tắt prefetch toàn public site: header/footer navigation nên giữ mặc định.
- Không cache admin/user-specific GET tùy tiện.
- Không bỏ AuthProvider refresh: đây là phần cốt lõi của RAM access token flow.
- Không lazy-load comments nếu UX cần comment hiện ngay dưới detail/reader.
