"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";
import {
  deleteNotification,
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  NotificationList,
  type Notification,
  type NotificationsPaginated,
} from "@/features/notifications";
import { PageContainer } from "@/shared/ui/PageContainer";
import { SectionHeader } from "@/shared/ui/SectionHeader";

const PAGE_LIMIT = 20;

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [data, setData] = useState<NotificationsPaginated | null>(null);
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadNotifications(nextPage = page, nextUnreadOnly = unreadOnly) {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await getMyNotifications({
        page: nextPage,
        limit: PAGE_LIMIT,
        unreadOnly: nextUnreadOnly,
      });
      setData(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Khong tai duoc thong bao",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login?next=/me/notifications");
      return;
    }

    const task = window.setTimeout(() => {
      void loadNotifications(page, unreadOnly);
    }, 0);

    return () => window.clearTimeout(task);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAuthLoading, page, unreadOnly, router]);

  async function handleOpen(notification: Notification) {
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
    }

    if (notification.url) {
      router.push(notification.url);
      return;
    }

    await loadNotifications(page, unreadOnly);
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Xoa thong bao nay?")) {
      return;
    }

    await deleteNotification(id);
    await loadNotifications(page, unreadOnly);
  }

  async function handleMarkAllRead() {
    await markAllNotificationsAsRead();
    await loadNotifications(page, unreadOnly);
  }

  function handleFilterChange(nextUnreadOnly: boolean) {
    setUnreadOnly(nextUnreadOnly);
    setPage(1);
  }

  if (isAuthLoading || !isAuthenticated) {
    return (
      <PageContainer>
        <p className="text-sm text-muted-foreground">Dang kiem tra dang nhap...</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SectionHeader
        title="Thong bao"
        description="Theo doi cac cap nhat moi tu nhung truyen ban dang theo doi."
        action={
          <Button type="button" onClick={() => void handleMarkAllRead()}>
            Danh dau tat ca da doc
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant={!unreadOnly ? "default" : "outline"}
          onClick={() => handleFilterChange(false)}
        >
          Tat ca
        </Button>
        <Button
          type="button"
          variant={unreadOnly ? "default" : "outline"}
          onClick={() => handleFilterChange(true)}
        >
          Chua doc
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Dang tai thong bao...</p>
      ) : errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : (
        <>
          <NotificationList
            notifications={data?.items ?? []}
            onOpen={handleOpen}
            onDelete={handleDelete}
          />

          {data ? (
            <div className="mt-6 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={!data.meta.hasPreviousPage}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
              >
                Trang truoc
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {data.meta.page}/{Math.max(data.meta.totalPages, 1)}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={!data.meta.hasNextPage}
                onClick={() => setPage((current) => current + 1)}
              >
                Trang sau
              </Button>
            </div>
          ) : null}
        </>
      )}
    </PageContainer>
  );
}
