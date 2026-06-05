"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AdminCommentReportsFilter,
  AdminCommentReportsTable,
  deleteReportedComment,
  getAdminCommentReports,
  updateAdminCommentReportStatus,
  type AdminCommentReportsPaginated,
  type AdminCommentReportsQuery,
  type CommentReportStatus,
} from "@/features/admin/comment-reports";

const DEFAULT_QUERY: AdminCommentReportsQuery = {
  limit: 20,
  page: 1,
};

export default function AdminCommentReportsPage() {
  const [reportsData, setReportsData] =
    useState<AdminCommentReportsPaginated | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState<AdminCommentReportsQuery>(DEFAULT_QUERY);

  const loadReports = useCallback(async (nextQuery: AdminCommentReportsQuery) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      setReportsData(await getAdminCommentReports(nextQuery));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Khong tai duoc bao cao binh luan",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => {
      void loadReports(query);
    }, 0);

    return () => window.clearTimeout(task);
  }, [loadReports, query]);

  function handleFilterChange(nextQuery: AdminCommentReportsQuery) {
    setQuery({
      ...nextQuery,
      limit: nextQuery.limit ?? 20,
      page: 1,
    });
  }

  function handlePageChange(page: number) {
    setQuery((currentQuery) => ({
      ...currentQuery,
      page,
    }));
  }

  async function handleStatusChange(id: number, status: CommentReportStatus) {
    setErrorMessage(null);

    try {
      await updateAdminCommentReportStatus(id, { status });
      await loadReports(query);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Cap nhat trang thai bao cao that bai",
      );
    }
  }

  async function handleDeleteComment(id: number) {
    setErrorMessage(null);

    try {
      await deleteReportedComment(id);
      await loadReports(query);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Xoa comment bi bao cao that bai",
      );
    }
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Bao cao binh luan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Xem, loc va xu ly cac bao cao binh luan cua nguoi dung.
        </p>
      </div>

      <AdminCommentReportsFilter
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
          Dang tai bao cao...
        </div>
      ) : reportsData ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>Tong {reportsData.meta.total} bao cao</span>
            <span>
              Trang {reportsData.meta.page}/{reportsData.meta.totalPages || 1}
            </span>
          </div>

          <AdminCommentReportsTable
            reports={reportsData.items}
            onDeleteComment={handleDeleteComment}
            onStatusChange={handleStatusChange}
          />

          {reportsData.meta.totalPages > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={!reportsData.meta.hasPreviousPage || isLoading}
                onClick={() => handlePageChange((query.page ?? 1) - 1)}
              >
                Trang truoc
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {reportsData.meta.page}/{reportsData.meta.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={!reportsData.meta.hasNextPage || isLoading}
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
