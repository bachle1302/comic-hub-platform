"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/modetoggle";
import { LogoutButton, useAuth } from "@/features/auth";
import { NotificationBell } from "@/features/notifications";
import { WalletBadge } from "@/features/wallet";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  if (pathname.startsWith("/admin")) {
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();
    router.push(
      trimmedQuery ? `/tim-kiem?q=${encodeURIComponent(trimmedQuery)}` : "/tim-kiem",
    );
    setIsOpen(false);
  }

  const navLinks = (
    <>
      <Link
        href="/truyen"
        className="hover:text-primary"
        onClick={() => setIsOpen(false)}
      >
        Truyen
      </Link>
      <Link
        href="/bang-xep-hang"
        className="hover:text-primary"
        onClick={() => setIsOpen(false)}
      >
        Bang xep hang
      </Link>
      {isAuthenticated ? (
        <>
          <Link
            href="/me/follows"
            className="hover:text-primary"
            onClick={() => setIsOpen(false)}
          >
            Theo doi
          </Link>
          <Link
            href="/me/histories"
            className="hover:text-primary"
            onClick={() => setIsOpen(false)}
          >
            Lich su
          </Link>
          <Link
            href="/me/notifications"
            className="hover:text-primary"
            onClick={() => setIsOpen(false)}
          >
            Thong bao
          </Link>
          <Link
            href="/me/change-password"
            className="hover:text-primary"
            onClick={() => setIsOpen(false)}
          >
            Doi mat khau
          </Link>
        </>
      ) : null}
      {user?.role === "ADMIN" ? (
        <Link
          href="/admin"
          className="hover:text-primary"
          onClick={() => setIsOpen(false)}
        >
          Admin
        </Link>
      ) : null}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-3 px-4 py-3">
        <Link href="/" className="shrink-0 text-lg font-bold tracking-tight">
          Comic Hub
        </Link>

        <nav className="hidden items-center gap-4 text-sm md:flex">{navLinks}</nav>

        <form onSubmit={handleSubmit} className="relative ml-auto hidden md:block md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tim truyen"
            className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </form>

        <div className="hidden items-center gap-2 md:flex">
          <ModeToggle />
          {isLoading ? (
            <span className="text-sm text-muted-foreground">...</span>
          ) : isAuthenticated && user ? (
            <>
              <WalletBadge />
              <NotificationBell />
              <span className="max-w-32 truncate text-sm text-muted-foreground">
                {user.name}
              </span>
              <LogoutButton variant="ghost" />
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
            >
              Dang nhap
            </Link>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="ml-auto md:hidden"
          onClick={() => setIsOpen((value) => !value)}
          aria-label="Mo menu"
        >
          {isOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </Button>
      </div>

      {isOpen ? (
        <div className="border-t px-4 py-3 md:hidden">
          <form onSubmit={handleSubmit} className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tim truyen"
              className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </form>
          <nav className="flex flex-col gap-3 text-sm">{navLinks}</nav>
          <div className="mt-4 flex items-center gap-2">
            <ModeToggle />
            {isAuthenticated && user ? (
              <>
                <WalletBadge />
                <NotificationBell />
                <span className="truncate text-sm text-muted-foreground">
                  {user.name}
                </span>
                <LogoutButton variant="ghost" />
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Dang nhap
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
