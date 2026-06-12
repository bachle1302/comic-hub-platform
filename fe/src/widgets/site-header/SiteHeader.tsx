"use client";

/* eslint-disable @next/next/no-img-element */
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  Menu,
  Search,
  X,
  User,
  Clock,
  Bookmark,
  Wallet,
  Settings,
  LogOut,
  ShieldAlert,
  Home,
  LayoutGrid,
  Trophy,
  Flag,
  Zap,
  BarChart3,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/modetoggle";
import { useAuth } from "@/features/auth/model/auth-store";
import { clientApiGet } from "@/shared/api/client-api";
import { categoriesSchema, type CategoryListItem } from "@/features/categories";

const PRESET_CATEGORIES = [
  { id: 1, name: "Action", slug: "action" },
  { id: 2, name: "Adventure", slug: "adventure" },
  { id: 3, name: "Comedy", slug: "comedy" },
  { id: 4, name: "Fantasy", slug: "fantasy" },
  { id: 5, name: "Drama", slug: "drama" },
  { id: 6, name: "Shounen", slug: "shounen" },
  { id: 7, name: "Romance", slug: "romance" },
  { id: 8, name: "School Life", slug: "school-life" },
];

const NotificationBell = dynamic(
  () =>
    import("@/features/notifications/ui/NotificationBell").then(
      (module) => module.NotificationBell,
    ),
  {
    ssr: false,
  },
);

const WalletBadge = dynamic(
  () =>
    import("@/features/wallet/ui/WalletBadge").then(
      (module) => module.WalletBadge,
    ),
  {
    ssr: false,
  },
);

export function SiteHeader() {
  const pathname = usePathname();
  const isHomeActive = pathname === "/";
  const isManhwaActive = pathname === "/the-loai/manhwa";
  const isMangaActive = pathname === "/the-loai/manga";
  const isManhuaActive = pathname === "/the-loai/manhua";
  const isNgonTinhActive = pathname === "/the-loai/ngon-tinh";
  const isSearchActive = pathname === "/tim-kiem";
  const isHistoriesActive = pathname === "/me/histories";
  const isFollowsActive = pathname === "/me/follows";
  const isCategoryActive = pathname.startsWith("/the-loai") && !isManhwaActive && !isMangaActive && !isManhuaActive && !isNgonTinhActive;
  const isRankingActive = pathname.startsWith("/bang-xep-hang");
  const router = useRouter();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<CategoryListItem[]>([]);

  useEffect(() => {
    clientApiGet("/categories", categoriesSchema)
      .then((data) => {
        setCategories(data.categories);
      })
      .catch((err) => {
        console.error("Failed to load categories in header:", err);
      });
  }, []);

  useEffect(() => {
    if (!showDropdown) return;
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest(".avatar-dropdown-container")) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [showDropdown]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();
    router.push(
      trimmedQuery ? `/tim-kiem?q=${encodeURIComponent(trimmedQuery)}` : "/tim-kiem",
    );
    setIsOpen(false);
  }

  async function handleLogout() {
    try {
      await logout();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <header className="relative z-50 w-full bg-zinc-100/95 dark:bg-black/95 backdrop-blur shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4">
        {/* Left Section: Logo & Search */}
        <div className="flex items-center gap-6 md:gap-8 flex-1 max-w-3xl mr-4">
          <Link href="/" prefetch={false} className="flex items-center gap-2.5 cursor-pointer group shrink-0">
            <svg 
              width="48" 
              height="48" 
              viewBox="0 0 100 100" 
              className="group-hover:rotate-90 transition-transform duration-500 ease-in-out drop-shadow-md shrink-0"
            >
              {/* Nền tròn Đỏ chuẩn */}
              <circle cx="50" cy="50" r="36" fill="#E53935" />
              
              {/* Lưỡi phi tiêu cong Đen (Base) */}
              <path d="M 50 2 Q 58 42 98 50 Q 58 58 50 98 Q 42 58 2 50 Q 42 42 50 2 Z" fill="#111111" />
              
              {/* Mảng màu Xám Than tạo khối 3D cắt vát cho phi tiêu */}
              <path d="M 50 2 Q 58 42 98 50 L 50 50 Z" fill="#1f2937" />
              <path d="M 50 98 Q 42 58 2 50 L 50 50 Z" fill="#1f2937" />
              
              {/* Tâm Sharingan Tối giản */}
              <circle cx="50" cy="50" r="12" fill="#E53935" />
              <circle cx="50" cy="50" r="5" fill="#111111" />
              <circle cx="50" cy="50" r="1.5" fill="#ffffff" />
            </svg>

            <span className="font-extrabold text-1xl tracking-tighter ml-0.5 flex items-center select-none">
              <span className="bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-700 dark:from-zinc-50 dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent font-black tracking-tight">
                Comic
              </span>
              <span className="relative ml-1.5 px-2.5 py-1 rounded bg-gradient-to-br from-[#E53935] to-orange-500 text-white text-sm font-black tracking-normal shadow-[0_0_12px_rgba(229,57,53,0.3)] group-hover:scale-105 group-hover:rotate-2 transition-all duration-300">
                HUB
              </span>
            </span>
          </Link>

          {/* Desktop Search - Positioned next to Comic HUB & Made larger */}
          <form onSubmit={handleSubmit} className="relative hidden sm:block flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm truyện..."
              className="h-10 w-full rounded-full border border-border bg-muted/40 pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary"
            />
          </form>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-3">
          {/* Actions Menu */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle - Desktop only */}
            <div className="hidden md:block">
              <ModeToggle />
            </div>

            {isLoading ? (
              <span className="text-sm text-muted-foreground">...</span>
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                {/* Wallet & Notifications - Desktop only */}
                <div className="hidden md:flex items-center gap-2">
                  <WalletBadge />
                  <NotificationBell />
                </div>

                {/* Avatar Dropdown Wrapper */}
                <div className="relative avatar-dropdown-container">
                  <button
                    type="button"
                    onClick={() => setShowDropdown((v) => !v)}
                    className="flex size-9 items-center justify-center overflow-hidden rounded-full border border-border bg-muted transition hover:opacity-95 focus:outline-none"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="grid size-full place-items-center text-muted-foreground bg-secondary/80">
                        <User className="size-4" />
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-border bg-background p-4 shadow-xl animate-fade-in z-50">
                      <div className="px-2 py-1.5 text-left">
                        <p className="text-sm font-bold text-foreground truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          ID: {user.id}
                        </p>
                      </div>

                      <div className="my-2 border-t border-border" />

                      <div className="space-y-1">
                        <Link
                          href="/me/change-password"
                          prefetch={false}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        >
                          <User className="size-4" />
                          <span>Thông tin tài khoản</span>
                        </Link>

                        <Link
                          href="/me/histories"
                          prefetch={false}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        >
                          <Clock className="size-4" />
                          <span>Lịch sử đọc truyện</span>
                        </Link>

                        <Link
                          href="/me/follows"
                          prefetch={false}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        >
                          <Bookmark className="size-4" />
                          <span>Truyện đang theo dõi</span>
                        </Link>

                        <Link
                          href="/me/wallet"
                          prefetch={false}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        >
                          <Wallet className="size-4 text-amber-500 fill-amber-500/10" />
                          <span>Nạp Xu / Linh Thạch</span>
                        </Link>

                        {user.role === "ADMIN" && (
                          <Link
                            href="/admin"
                            prefetch={false}
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-500/10 hover:text-red-600"
                          >
                            <ShieldAlert className="size-4" />
                            <span>Quản trị hệ thống</span>
                          </Link>
                        )}
                      </div>

                      <div className="my-2 border-t border-border" />

                      <div className="space-y-1">
                        <Link
                          href="/me/change-password"
                          prefetch={false}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        >
                          <Settings className="size-4" />
                          <span>Cài đặt</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setShowDropdown(false);
                            void handleLogout();
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-500/10 hover:text-red-600"
                        >
                          <LogOut className="size-4" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                prefetch={false}
                className="rounded-full border border-border px-4 py-1.5 text-xs font-bold text-foreground transition hover:text-[#E53935] hover:border-[#E53935] hover:bg-[#E53935]/5"
              >
                Đăng nhập
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="md:hidden size-9 rounded-full border border-border"
              onClick={() => setIsOpen((value) => !value)}
              aria-label="Mở menu"
            >
              {isOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Navigation Sub-header (visible on md and up) */}
      <div className="hidden md:block bg-zinc-100 dark:bg-black shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 flex flex-wrap items-center justify-start gap-7 text-sm font-medium text-zinc-600 dark:text-zinc-300 select-none">
          {/* Trang Chủ */}
          <Link
            href="/"
            prefetch={false}
            className={`flex items-center gap-1.5 transition py-1 group ${isHomeActive ? "text-[#E53935]" : "hover:text-[#E53935]"}`}
          >
            <Home className={`size-3.5 transition-colors duration-200 ${isHomeActive ? "text-[#E53935]" : "text-zinc-500 dark:text-zinc-400 group-hover:text-[#E53935]"}`} />
            <span>Trang Chủ</span>
          </Link>

          {/* Thể Loại Dropdown */}
          <div className="relative group/category">
            <button className={`flex items-center gap-1.5 transition py-1 cursor-pointer ${isCategoryActive ? "text-[#E53935]" : "hover:text-[#E53935] group-hover/category:text-[#E53935]"}`}>
              <LayoutGrid className={`size-3.5 transition-colors duration-200 ${isCategoryActive ? "text-[#E53935]" : "text-zinc-500 dark:text-zinc-400 group-hover/category:text-[#E53935]"}`} />
              <span>Thể Loại</span>
              <ChevronDown className={`size-3 transition-all duration-200 ${isCategoryActive ? "rotate-180 text-[#E53935]" : "group-hover/category:rotate-180 group-hover/category:text-[#E53935]"}`} />
            </button>
            <div className="absolute left-0 top-full pt-2.5 hidden group-hover/category:block z-50">
              <div className="grid grid-cols-3 gap-2 w-72 rounded-xl border border-border bg-background p-3 shadow-xl">
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/the-loai/${c.slug}`}
                      prefetch={false}
                      className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition"
                    >
                      {c.name}
                    </Link>
                  ))
                ) : (
                  PRESET_CATEGORIES.map((c) => (
                    <Link
                      key={c.id}
                      href={`/the-loai/${c.slug}`}
                      prefetch={false}
                      className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition"
                    >
                      {c.name}
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Xếp Hạng Dropdown */}
          <div className="relative group/ranking">
            <button className={`flex items-center gap-1.5 transition py-1 cursor-pointer ${isRankingActive ? "text-[#E53935]" : "hover:text-[#E53935] group-hover/ranking:text-[#E53935]"}`}>
              <Trophy className={`size-3.5 transition-colors duration-200 ${isRankingActive ? "text-[#E53935]" : "text-zinc-500 dark:text-zinc-400 group-hover/ranking:text-[#E53935]"}`} />
              <span>Xếp Hạng</span>
              <ChevronDown className={`size-3 transition-all duration-200 ${isRankingActive ? "rotate-180 text-[#E53935]" : "group-hover/ranking:rotate-180 group-hover/ranking:text-[#E53935]"}`} />
            </button>
            <div className="absolute left-0 top-full pt-2.5 hidden group-hover/ranking:block z-50">
              <div className="flex flex-col w-44 rounded-xl border border-border bg-background p-2 shadow-xl">
                <Link
                  href="/bang-xep-hang?type=hot"
                  prefetch={false}
                  className="rounded-lg px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition"
                >
                  Top Hot
                </Link>
                <Link
                  href="/bang-xep-hang?type=views"
                  prefetch={false}
                  className="rounded-lg px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition"
                >
                  Top Lượt Xem
                </Link>
                <Link
                  href="/bang-xep-hang?type=follows"
                  prefetch={false}
                  className="rounded-lg px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition"
                >
                  Top Theo Dõi
                </Link>
                <Link
                  href="/bang-xep-hang?type=likes"
                  prefetch={false}
                  className="rounded-lg px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition"
                >
                  Top Yêu Thích
                </Link>
                <Link
                  href="/bang-xep-hang?type=latest"
                  prefetch={false}
                  className="rounded-lg px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition"
                >
                  Mới Cập Nhật
                </Link>
              </div>
            </div>
          </div>

          {/* Top Manhwa */}
          <Link
            href="/the-loai/manhwa"
            prefetch={false}
            className={`flex items-center gap-1.5 transition py-1 group ${isManhwaActive ? "text-[#E53935]" : "hover:text-[#E53935]"}`}
          >
            <Flag className={`size-3.5 transition-colors duration-200 ${isManhwaActive ? "text-[#E53935]" : "text-zinc-500 dark:text-zinc-400 group-hover:text-[#E53935]"}`} />
            <span>Top Manhwa</span>
          </Link>

          {/* Top Manga */}
          <Link
            href="/the-loai/manga"
            prefetch={false}
            className={`flex items-center gap-1.5 transition py-1 group ${isMangaActive ? "text-[#E53935]" : "hover:text-[#E53935]"}`}
          >
            <Zap className={`size-3.5 transition-colors duration-200 ${isMangaActive ? "text-[#E53935]" : "text-zinc-500 dark:text-zinc-400 group-hover:text-[#E53935]"}`} />
            <span>Top Manga</span>
          </Link>

          {/* Top Manhua */}
          <Link
            href="/the-loai/manhua"
            prefetch={false}
            className={`flex items-center gap-1.5 transition py-1 group ${isManhuaActive ? "text-[#E53935]" : "hover:text-[#E53935]"}`}
          >
            <BarChart3 className={`size-3.5 transition-colors duration-200 ${isManhuaActive ? "text-[#E53935]" : "text-zinc-500 dark:text-zinc-400 group-hover:text-[#E53935]"}`} />
            <span>Top Manhua</span>
          </Link>

          {/* Tìm Truyện */}
          <Link
            href="/tim-kiem"
            prefetch={false}
            className={`flex items-center gap-1.5 transition py-1 group ${isSearchActive ? "text-[#E53935]" : "hover:text-[#E53935]"}`}
          >
            <Search className={`size-3.5 transition-colors duration-200 ${isSearchActive ? "text-[#E53935]" : "text-zinc-500 dark:text-zinc-400 group-hover:text-[#E53935]"}`} />
            <span>Tìm Truyện</span>
          </Link>

          {/* Lịch Sử */}
          <Link
            href="/me/histories"
            prefetch={false}
            className={`flex items-center gap-1.5 transition py-1 group ${isHistoriesActive ? "text-[#E53935]" : "hover:text-[#E53935]"}`}
          >
            <Clock className={`size-3.5 transition-colors duration-200 ${isHistoriesActive ? "text-[#E53935]" : "text-zinc-500 dark:text-zinc-400 group-hover:text-[#E53935]"}`} />
            <span>Lịch Sử</span>
          </Link>

          {/* Theo Dõi */}
          <Link
            href="/me/follows"
            prefetch={false}
            className={`flex items-center gap-1.5 transition py-1 group ${isFollowsActive ? "text-[#E53935]" : "hover:text-[#E53935]"}`}
          >
            <Bookmark className={`size-3.5 transition-colors duration-200 ${isFollowsActive ? "text-[#E53935]" : "text-zinc-500 dark:text-zinc-400 group-hover:text-[#E53935]"}`} />
            <span>Theo Dõi</span>
          </Link>

          {/* Truyện ngôn tình */}
          <Link
            href="/the-loai/ngon-tinh"
            prefetch={false}
            className={`flex items-center gap-1.5 transition py-1 group ${isNgonTinhActive ? "text-[#E53935]" : "hover:text-[#E53935]"}`}
          >
            <BookOpen className={`size-3.5 transition-colors duration-200 ${isNgonTinhActive ? "text-[#E53935]" : "text-zinc-500 dark:text-zinc-400 group-hover:text-[#E53935]"}`} />
            <span>Truyện ngôn tình</span>
          </Link>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen ? (
        <div className="border-t border-border px-4 py-4 md:hidden bg-zinc-100 dark:bg-black space-y-4">
          {/* Mobile Search */}
          <form onSubmit={handleSubmit} className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm truyện..."
              className="h-10 w-full rounded-full border border-border bg-muted/40 pl-9 pr-3 text-xs outline-none focus:border-primary focus:bg-background"
            />
          </form>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 text-sm font-semibold">
            <Link
              href="/"
              prefetch={false}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              <Home className="size-4 text-blue-500" />
              <span>Trang Chủ</span>
            </Link>
            
            <Link
              href="/truyen"
              prefetch={false}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              <LayoutGrid className="size-4 text-orange-500" />
              <span>Thể Loại</span>
            </Link>

            <Link
              href="/bang-xep-hang"
              prefetch={false}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              <Trophy className="size-4 text-yellow-500" />
              <span>Xếp Hạng</span>
            </Link>

            <Link
              href="/the-loai/manhwa"
              prefetch={false}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              <Flag className="size-4 text-green-500" />
              <span>Top Manhwa</span>
            </Link>

            <Link
              href="/the-loai/manga"
              prefetch={false}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              <Zap className="size-4 text-purple-500" />
              <span>Top Manga</span>
            </Link>

            <Link
              href="/the-loai/manhua"
              prefetch={false}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              <BarChart3 className="size-4 text-red-500" />
              <span>Top Manhua</span>
            </Link>

            <Link
              href="/tim-kiem"
              prefetch={false}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              <Search className="size-4 text-sky-500" />
              <span>Tìm Truyện</span>
            </Link>

            <Link
              href="/the-loai/ngon-tinh"
              prefetch={false}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              <BookOpen className="size-4 text-teal-500" />
              <span>Truyện ngôn tình</span>
            </Link>

            {isAuthenticated && user && (
              <>
                <div className="my-2 border-t border-border" />
                <p className="px-3 py-1 text-xs text-muted-foreground uppercase tracking-wider font-bold">Cá nhân</p>
                <Link
                  href="/me/change-password"
                  prefetch={false}
                  className="rounded-xl px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  Thông tin tài khoản
                </Link>
                <Link
                  href="/me/histories"
                  prefetch={false}
                  className="rounded-xl px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  Lịch sử đọc truyện
                </Link>
                <Link
                  href="/me/follows"
                  prefetch={false}
                  className="rounded-xl px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  Truyện đang theo dõi
                </Link>
                <Link
                  href="/me/wallet"
                  prefetch={false}
                  className="rounded-xl px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  Nạp Xu / Linh Thạch
                </Link>
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    prefetch={false}
                    className="rounded-xl px-3 py-2 text-red-500 transition hover:bg-red-500/10 hover:text-red-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Quản trị hệ thống
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    void handleLogout();
                  }}
                  className="w-full text-left rounded-xl px-3 py-2 text-red-500 transition hover:bg-red-500/10 hover:text-red-600"
                >
                  Đăng xuất
                </button>
              </>
            )}
          </nav>

          {/* Footer Controls Row - Mobile */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <div className="flex items-center gap-2">
              {isAuthenticated && user && (
                <>
                  <WalletBadge />
                  <NotificationBell />
                </>
              )}
            </div>
            <ModeToggle />
          </div>
        </div>
      ) : null}
    </header>
  );
}
