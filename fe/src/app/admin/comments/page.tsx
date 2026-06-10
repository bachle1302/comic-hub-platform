"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AdminCommentsFilter,
  AdminCommentsTable,
  deleteAdminComment,
  getAdminComments,
  type AdminCommentsPaginated,
  type AdminCommentsQuery,
} from "@/features/admin/comments";
import { areShallowObjectsEqual } from "@/shared/utils/object";

const DEFAULT_QUERY: AdminCommentsQuery = {
  limit: 20,
  page: 1,
};

export default function AdminCommentsPage() {
  const [commentsData, setCommentsData] =
    useState<AdminCommentsPaginated | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState<AdminCommentsQuery>(DEFAULT_QUERY);

  const loadComments = useCallback(async (nextQuery: AdminCommentsQuery) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      setCommentsData(await getAdminComments(nextQuery));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Không tải được bình luận",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => {
      void loadComments(query);
    }, 0);

    return () => window.clearTimeout(task);
  }, [loadComments, query]);

  function handleFilterChange(nextQuery: AdminCommentsQuery) {
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

  async function handleDelete(id: number) {
    setDeletingId(id);
    setErrorMessage(null);

    try {
      await deleteAdminComment(id);
      setCommentsData((currentData) => {
        if (!currentData) {
          return currentData;
        }

        if (query.deleted === "all") {
          return {
            ...currentData,
            items: currentData.items.map((comment) =>
              comment.id === id ? { ...comment, isDeleted: true } : comment,
            ),
          };
        }

        return {
          ...currentData,
          items: currentData.items.filter((comment) => comment.id !== id),
        };
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Xóa bình luận thất bại",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Quản lý bình luận</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Xem, lọc và xóa bình luận trong hệ thống.
        </p>
      </div>

      <AdminCommentsFilter
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
          Đang tải bình luận...
        </div>
      ) : commentsData ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>Tổng {commentsData.meta.total} bình luận</span>
            <span>
              Trang {commentsData.meta.page}/{commentsData.meta.totalPages || 1}
            </span>
          </div>

          <AdminCommentsTable
            comments={commentsData.items}
            deletingId={deletingId}
            onDelete={handleDelete}
          />

          {commentsData.meta.totalPages > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={!commentsData.meta.hasPreviousPage || isLoading}
                onClick={() => handlePageChange((query.page ?? 1) - 1)}
              >
                Trang trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {commentsData.meta.page}/{commentsData.meta.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={!commentsData.meta.hasNextPage || isLoading}
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
