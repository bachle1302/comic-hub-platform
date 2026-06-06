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
          : "Khong tai duoc nhat ky quan tri",
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
        <h1 className="text-2xl font-bold">Nhat ky quan tri</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Theo doi cac thao tac quan trong cua admin trong he thong.
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
          Dang tai nhat ky quan tri...
        </div>
      ) : logsData ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>Tong {logsData.meta.total} log</span>
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
                Trang truoc
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
