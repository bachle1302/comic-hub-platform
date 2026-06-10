"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AdminAnnouncementsFilter,
  AdminAnnouncementsTable,
  broadcastAdminAnnouncement,
  deleteAdminAnnouncement,
  getAdminAnnouncements,
  type AdminAnnouncementsQuery,
  type AnnouncementsPaginated,
} from "@/features/announcements";
import { AdminLink } from "@/shared/ui/AdminLink";
import { areShallowObjectsEqual } from "@/shared/utils/object";

const DEFAULT_QUERY: AdminAnnouncementsQuery = {
  limit: 20,
  page: 1,
};

export default function AdminAnnouncementsPage() {
  const [data, setData] = useState<AnnouncementsPaginated | null>(null);
  const [query, setQuery] = useState<AdminAnnouncementsQuery>(DEFAULT_QUERY);
  const [broadcastingId, setBroadcastingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnnouncements = useCallback(
    async (nextQuery: AdminAnnouncementsQuery) => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        setData(await getAdminAnnouncements(nextQuery));
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Không tải được thông báo hệ thống",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const task = window.setTimeout(() => {
      void loadAnnouncements(query);
    }, 0);

    return () => window.clearTimeout(task);
  }, [loadAnnouncements, query]);

  function handleFilterChange(nextQuery: AdminAnnouncementsQuery) {
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
    setSuccessMessage(null);

    try {
      await deleteAdminAnnouncement(id);
      setSuccessMessage("Đã vô hiệu hóa thông báo.");
      setData((currentData) => {
        if (!currentData) {
          return currentData;
        }

        if (query.isActive === true) {
          return {
            ...currentData,
            items: currentData.items.filter(
              (announcement) => announcement.id !== id,
            ),
          };
        }

        return {
          ...currentData,
          items: currentData.items.map((announcement) =>
            announcement.id === id
              ? { ...announcement, isActive: false }
              : announcement,
          ),
        };
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Vô hiệu hóa thông báo thất bại",
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleBroadcast(id: number) {
    setBroadcastingId(id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await broadcastAdminAnnouncement(id);
      setSuccessMessage(`Đã gửi ${result.createdCount} thông báo.`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gửi thông báo thất bại",
      );
    } finally {
      setBroadcastingId(null);
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Thông báo hệ thống</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý banner/thông báo hiển thị trên website.
          </p>
        </div>
        <Button asChild>
          <AdminLink href="/admin/announcements/new">Tạo thông báo</AdminLink>
        </Button>
      </div>

      <AdminAnnouncementsFilter
        initialQuery={query}
        onChange={handleFilterChange}
      />

      {successMessage ? (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-lg border p-6 text-sm text-muted-foreground">
          Đang tải thông báo...
        </div>
      ) : data ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>Tổng {data.meta.total} thông báo</span>
            <span>
              Trang {data.meta.page}/{data.meta.totalPages || 1}
            </span>
          </div>

          <AdminAnnouncementsTable
            announcements={data.items}
            broadcastingId={broadcastingId}
            deletingId={deletingId}
            onBroadcast={handleBroadcast}
            onDelete={handleDelete}
          />

          {data.meta.totalPages > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={!data.meta.hasPreviousPage || isLoading}
                onClick={() => handlePageChange((query.page ?? 1) - 1)}
              >
                Trang trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {data.meta.page}/{data.meta.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={!data.meta.hasNextPage || isLoading}
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
