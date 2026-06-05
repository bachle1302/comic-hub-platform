"use client";

import { Button } from "@/components/ui/button";
import type { Notification } from "../api/notifications.schema";

type NotificationListProps = {
  compact?: boolean;
  notifications: Notification[];
  onDelete?: (id: number) => Promise<void> | void;
  onOpen?: (notification: Notification) => Promise<void> | void;
};

function formatNotificationDate(value: string): string {
  return new Date(value).toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function getNotificationTypeLabel(type: Notification["type"]): string {
  switch (type) {
    case "NEW_CHAPTER":
      return "Chuong moi";
    case "COMMENT":
      return "Binh luan";
    case "REPLY_COMMENT":
      return "Phan hoi";
    case "SYSTEM":
      return "He thong";
  }
}

export function NotificationList({
  compact = false,
  notifications,
  onDelete,
  onOpen,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <p className="px-3 py-4 text-sm text-muted-foreground">
        Chua co thong bao nao.
      </p>
    );
  }

  return (
    <div className={compact ? "max-h-96 overflow-y-auto" : "space-y-3"}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={
            compact
              ? "border-b last:border-b-0"
              : "rounded-lg border bg-background"
          }
        >
          <div className="flex items-start gap-2 p-3">
            <span
              className={
                notification.isRead
                  ? "mt-1.5 size-2 shrink-0 rounded-full bg-transparent"
                  : "mt-1.5 size-2 shrink-0 rounded-full bg-primary"
              }
            />

            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={() => void onOpen?.(notification)}
            >
              <span className="mb-1 inline-flex rounded-full border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {getNotificationTypeLabel(notification.type)}
              </span>
              <p className="line-clamp-2 text-sm font-medium">
                {notification.title}
              </p>
              {notification.message ? (
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {notification.message}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-muted-foreground">
                {formatNotificationDate(notification.createdAt)}
              </p>
            </button>

            {onDelete ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => void onDelete(notification.id)}
              >
                Xoa
              </Button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
