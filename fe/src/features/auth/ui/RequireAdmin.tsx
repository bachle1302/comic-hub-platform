"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useAuth } from "../model/auth-store";

type RequireAdminProps = {
  children: ReactNode;
};

export function RequireAdmin({ children }: RequireAdminProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        Dang kiem tra quyen truy cap...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="rounded-lg border p-6">
        <h1 className="text-xl font-semibold">Ban khong co quyen truy cap</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Khu vuc nay chi danh cho tai khoan quan tri.
        </p>
      </div>
    );
  }

  return children;
}
