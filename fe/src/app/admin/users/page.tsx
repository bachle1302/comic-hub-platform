"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AdminUsersFilter,
  AdminUsersTable,
  getAdminUsers,
  type AdminUsersPaginated,
  type AdminUsersQuery,
} from "@/features/admin/users";
import { areShallowObjectsEqual } from "@/shared/utils/object";

const DEFAULT_QUERY: AdminUsersQuery = {
  limit: 20,
  page: 1,
};

export default function AdminUsersPage() {
  const [usersData, setUsersData] = useState<AdminUsersPaginated | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState<AdminUsersQuery>(DEFAULT_QUERY);

  const loadUsers = useCallback(async (nextQuery: AdminUsersQuery) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      setUsersData(await getAdminUsers(nextQuery));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Không tải được người dùng",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => {
      void loadUsers(query);
    }, 0);

    return () => window.clearTimeout(task);
  }, [loadUsers, query]);

  function handleFilterChange(nextQuery: AdminUsersQuery) {
    const normalizedQuery = {
      ...nextQuery,
      limit: nextQuery.limit ?? 20,
      page: 1,
    };

    setQuery((currentQuery) =>
      areShallowObjectsEqual(currentQuery, normalizedQuery)
        ? currentQuery
        : normalizedQuery,
    );
  }

  function handlePageChange(page: number) {
    setQuery((currentQuery) => ({
      ...currentQuery,
      page,
    }));
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Xem người dùng, tìm kiếm theo tên/email và vào chi tiết để điều chỉnh coin.
        </p>
      </div>

      <AdminUsersFilter initialQuery={query} onChange={handleFilterChange} />

      {errorMessage ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">
          Đang tải người dùng...
        </div>
      ) : usersData ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>Tổng {usersData.meta.total} người dùng</span>
            <span>
              Trang {usersData.meta.page}/{usersData.meta.totalPages || 1}
            </span>
          </div>

          <AdminUsersTable users={usersData.items} />

          {usersData.meta.totalPages > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={!usersData.meta.hasPreviousPage || isLoading}
                onClick={() => handlePageChange((query.page ?? 1) - 1)}
              >
                Trang trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {usersData.meta.page}/{usersData.meta.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={!usersData.meta.hasNextPage || isLoading}
                onClick={() => handlePageChange((query.page ?? 1) + 1)}
              >
                Trang sau
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
