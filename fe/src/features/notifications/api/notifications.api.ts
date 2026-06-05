import {
  clientApiDelete,
  clientApiGet,
  clientApiPatch,
} from "@/shared/api/client-api";
import {
  deleteNotificationResultSchema,
  markAllReadResultSchema,
  notificationSchema,
  notificationsPaginatedSchema,
  unreadCountSchema,
  type DeleteNotificationResult,
  type MarkAllReadResult,
  type Notification,
  type NotificationsPaginated,
  type NotificationsQuery,
  type UnreadCount,
} from "./notifications.schema";

function buildNotificationsQuery(query?: NotificationsQuery): string {
  const params = new URLSearchParams();

  if (query?.page !== undefined) {
    params.set("page", String(query.page));
  }

  if (query?.limit !== undefined) {
    params.set("limit", String(query.limit));
  }

  if (query?.unreadOnly !== undefined) {
    params.set("unreadOnly", String(query.unreadOnly));
  }

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}

export function getMyNotifications(
  query?: NotificationsQuery,
): Promise<NotificationsPaginated> {
  return clientApiGet(
    `/notifications/me${buildNotificationsQuery(query)}`,
    notificationsPaginatedSchema,
    {
      auth: true,
    },
  );
}

export function getUnreadNotificationCount(): Promise<UnreadCount> {
  return clientApiGet("/notifications/unread-count", unreadCountSchema, {
    auth: true,
  });
}

export function markNotificationAsRead(id: number): Promise<Notification> {
  return clientApiPatch(`/notifications/${id}/read`, notificationSchema, undefined, {
    auth: true,
  });
}

export function markAllNotificationsAsRead(): Promise<MarkAllReadResult> {
  return clientApiPatch(
    "/notifications/read-all",
    markAllReadResultSchema,
    undefined,
    {
      auth: true,
    },
  );
}

export function deleteNotification(
  id: number,
): Promise<DeleteNotificationResult> {
  return clientApiDelete(
    `/notifications/${id}`,
    deleteNotificationResultSchema,
    {
      auth: true,
    },
  );
}
