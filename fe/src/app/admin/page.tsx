"use client";

import { useEffect, useState } from "react";
import { AdminStatsCards, getAdminDashboardStats, type AdminDashboardStats } from "@/features/admin/dashboard";
import { AdminLink } from "@/shared/ui/AdminLink";

export default function AdminPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const nextStats = await getAdminDashboardStats();

        if (isMounted) {
          setStats(nextStats);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : "Không tải được thống kê",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const adminLinks = [
    { href: "/admin/users", label: "Người dùng", description: "Quản lý người dùng và coin" },
    { href: "/admin/comics", label: "Truyện tranh", description: "Quản lý truyện tranh" },
    { href: "/admin/chapters", label: "Chương truyện", description: "Quản lý chương truyện" },
    {
      href: "/admin/comments",
      label: "Bình luận",
      description: "Quản lý bình luận",
    },
    { href: "/admin/authors", label: "Tác giả", description: "Quản lý tác giả" },
    {
      href: "/admin/categories",
      label: "Thể loại",
      description: "Quản lý thể loại",
    },
  ] as const;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bảng điều khiển Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Theo dõi số liệu tổng quan và truy cập nhanh các khu vực quản trị.
        </p>
      </div>

      {errorMessage ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-lg border bg-muted/30"
            />
          ))}
        </div>
      ) : stats ? (
        <AdminStatsCards stats={stats} />
      ) : null}

      <div>
        <h2 className="text-lg font-semibold">Liên kết nhanh</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Các trang quản trị thường dùng.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {adminLinks.map((item) => (
          <AdminLink
            key={item.href}
            href={item.href}
            className="rounded-lg border bg-card p-4 hover:bg-muted"
          >
            <span className="text-sm font-semibold">{item.label}</span>
            <span className="mt-1 block text-sm text-muted-foreground">
              {item.description}
            </span>
          </AdminLink>
        ))}
      </div>
    </div>
  );
}
