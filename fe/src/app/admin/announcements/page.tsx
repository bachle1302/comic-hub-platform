"use client";

import Link from "next/link";
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
            : "Khong tai duoc thong bao he thong",
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

  async function handleDelete(id: number) {
    setDeletingId(id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await deleteAdminAnnouncement(id);
      setSuccessMessage("Da disable announcement.");
      await loadAnnouncements(query);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Disable announcement that bai",
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
      setSuccessMessage(`Da gui ${result.createdCount} notification.`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gui notification that bai",
      );
    } finally {
      setBroadcastingId(null);
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Thong bao he thong</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quan ly banner/thong bao hien thi tren website.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/announcements/new">Tao thong bao</Link>
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
          Dang tai thong bao...
        </div>
      ) : data ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>Tong {data.meta.total} thong bao</span>
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
                Trang truoc
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
