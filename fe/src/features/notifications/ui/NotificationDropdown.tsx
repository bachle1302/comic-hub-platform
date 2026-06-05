"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../api/notifications.api";
import type { Notification } from "../api/notifications.schema";
import { NotificationList } from "./NotificationList";

type NotificationDropdownProps = {
  onChanged?: () => Promise<void> | void;
  onClose?: () => void;
};

export function NotificationDropdown({
  onChanged,
  onClose,
}: NotificationDropdownProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    if (isAuthLoading || !isAuthenticated) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await getMyNotifications({ page: 1, limit: 5 });
      setNotifications(result.items);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Khong tai duoc thong bao",
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isAuthLoading]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) {
      const task = window.setTimeout(() => {
        setNotifications([]);
        setIsLoading(false);
      }, 0);

      return () => window.clearTimeout(task);
    }

    const task = window.setTimeout(() => {
      void loadNotifications();
    }, 0);

    return () => window.clearTimeout(task);
  }, [isAuthenticated, isAuthLoading, loadNotifications]);

  async function handleOpen(notification: Notification) {
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification.id);
        await onChanged?.();
      }
    } finally {
      onClose?.();

      if (notification.url) {
        router.push(notification.url);
      }
    }
  }

  async function handleMarkAllRead() {
    setErrorMessage(null);

    try {
      await markAllNotificationsAsRead();
      await loadNotifications();
      await onChanged?.();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Cap nhat that bai");
    }
  }

  return (
    <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-lg border bg-background shadow-lg">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <p className="font-semibold">Thong bao</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={() => void handleMarkAllRead()}
        >
          Danh dau da doc
        </Button>
      </div>

      {isLoading ? (
        <p className="px-3 py-4 text-sm text-muted-foreground">
          Dang tai thong bao...
        </p>
      ) : errorMessage ? (
        <p className="px-3 py-4 text-sm text-destructive">{errorMessage}</p>
      ) : (
        <NotificationList
          notifications={notifications}
          compact
          onOpen={handleOpen}
        />
      )}

      <div className="border-t px-3 py-2 text-right">
        <Link
          href="/me/notifications"
          className="text-sm text-primary hover:underline"
          onClick={onClose}
        >
          Xem tat ca
        </Link>
      </div>
    </div>
  );
}
