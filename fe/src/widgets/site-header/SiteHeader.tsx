"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Menu,
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
import { SearchAutocomplete } from "@/features/search";

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

  if (pathname.startsWith("/admin")) {
    return null;
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
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Left Section: Logo & Links */}
        <div className="flex items-center gap-6">
          <Link href="/" prefetch={false} className="text-lg font-black tracking-wider text-foreground">
            COMIC HUB
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
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
          <SearchAutocomplete
            className="hidden sm:block w-48 md:w-64 lg:w-72"
            placeholder="Tìm truyện..."
          />

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
                className="rounded-full border border-border px-4 py-1.5 text-xs font-bold text-foreground transition hover:bg-muted"
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
              aria-label="Mo menu"
            >
              {isOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen ? (
        <div className="border-t border-border px-4 py-4 md:hidden bg-background space-y-4">
          {/* Mobile Search */}
          <SearchAutocomplete
            className="w-full"
            inputClassName="h-10"
            placeholder="Tìm truyện..."
            onSelectSuggestion={() => setIsOpen(false)}
          />

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
