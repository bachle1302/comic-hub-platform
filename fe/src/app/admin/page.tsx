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
            error instanceof Error ? error.message : "Khong tai duoc thong ke",
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
    { href: "/admin/users", label: "Users", description: "Quan ly user va coin" },
    { href: "/admin/comics", label: "Comics", description: "Quan ly truyen" },
    { href: "/admin/chapters", label: "Chapters", description: "Quan ly chuong" },
    {
      href: "/admin/comments",
      label: "Comments",
      description: "Quan ly binh luan",
    },
    { href: "/admin/authors", label: "Authors", description: "Quan ly tac gia" },
    {
      href: "/admin/categories",
      label: "Categories",
      description: "Quan ly the loai",
    },
  ] as const;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Theo doi so lieu tong quan va truy cap nhanh cac khu vuc quan tri.
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
        <h2 className="text-lg font-semibold">Quick links</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Cac trang quan tri thuong dung.
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
