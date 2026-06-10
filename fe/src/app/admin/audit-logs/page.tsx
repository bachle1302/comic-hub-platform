"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AdminAuditLogsFilter,
  AdminAuditLogsTable,
  getAdminAuditLogs,
  type AdminAuditLogsPaginated,
  type AdminAuditLogsQuery,
} from "@/features/admin/audit-logs";
import { areShallowObjectsEqual } from "@/shared/utils/object";

const DEFAULT_QUERY: AdminAuditLogsQuery = {
  limit: 20,
  page: 1,
};

export default function AdminAuditLogsPage() {
  const [logsData, setLogsData] = useState<AdminAuditLogsPaginated | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState<AdminAuditLogsQuery>(DEFAULT_QUERY);

  const loadAuditLogs = useCallback(async (nextQuery: AdminAuditLogsQuery) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      setLogsData(await getAdminAuditLogs(nextQuery));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không tải được nhật ký quản trị",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => {
      void loadAuditLogs(query);
    }, 0);

    return () => window.clearTimeout(task);
  }, [loadAuditLogs, query]);

  function handleFilterChange(nextQuery: AdminAuditLogsQuery) {
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
        <h1 className="text-2xl font-bold">Nhật ký quản trị</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Theo dõi các thao tác quan trọng của quản trị viên trong hệ thống.
        </p>
      </div>

      <AdminAuditLogsFilter
        initialQuery={query}
        onChange={handleFilterChange}
      />

      {errorMessage ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">
          Đang tải nhật ký quản trị...
        </div>
      ) : logsData ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>Tổng {logsData.meta.total} bản ghi</span>
            <span>
              Trang {logsData.meta.page}/{logsData.meta.totalPages || 1}
            </span>
          </div>

          <AdminAuditLogsTable logs={logsData.items} />

          {logsData.meta.totalPages > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={!logsData.meta.hasPreviousPage || isLoading}
                onClick={() => handlePageChange((query.page ?? 1) - 1)}
              >
                Trang trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {logsData.meta.page}/{logsData.meta.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={!logsData.meta.hasNextPage || isLoading}
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
