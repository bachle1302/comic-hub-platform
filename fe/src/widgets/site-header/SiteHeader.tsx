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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/modetoggle";
import { useAuth } from "@/features/auth/model/auth-store";

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
  const router = useRouter();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [query, setQuery] = useState("");

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
    <header className="sticky top-0 z-50 bg-zinc-100/95 dark:bg-zinc-900/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4">
        {/* Left Section: Logo & Links */}
        <div className="flex items-center gap-8">
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

            <span className="font-extrabold text-3xl tracking-tighter ml-0.5 flex items-center select-none">
              <span className="bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-700 dark:from-zinc-50 dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent font-black tracking-tight">
                Comic
              </span>
              <span className="relative ml-1.5 px-2.5 py-1 rounded bg-gradient-to-br from-[#E53935] to-orange-500 text-white text-sm font-black tracking-normal shadow-[0_0_12px_rgba(229,57,53,0.3)] group-hover:scale-105 group-hover:rotate-2 transition-all duration-300">
                HUB
              </span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-6 text-base font-semibold md:flex">
            <Link
              href="/truyen"
              prefetch={false}
              className="text-muted-foreground transition hover:text-foreground"
            >
              Truyện
            </Link>
            <Link
              href="/bang-xep-hang"
              prefetch={false}
              className="text-muted-foreground transition hover:text-foreground"
            >
              Bảng xếp hạng
            </Link>
          </nav>
        </div>

        {/* Right Section: Search & Actions */}
        <div className="flex items-center gap-3">
          {/* Desktop Search */}
          <form onSubmit={handleSubmit} className="relative hidden sm:block w-48 md:w-64 lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm truyện..."
              className="h-9 w-full rounded-full border border-border bg-muted/40 pl-9 pr-3 text-xs outline-none transition focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary"
            />
          </form>

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
                    <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-border bg-card p-4 shadow-xl animate-fade-in z-50">
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

      {/* Mobile Drawer */}
      {isOpen ? (
        <div className="border-t border-border px-4 py-4 md:hidden bg-zinc-100 dark:bg-zinc-900 space-y-4">
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
              href="/truyen"
              prefetch={false}
              className="rounded-xl px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              Truyện tranh
            </Link>
            <Link
              href="/bang-xep-hang"
              prefetch={false}
              className="rounded-xl px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              Bảng xếp hạng
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
