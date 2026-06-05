import { z } from "zod";
import { paginationMetaSchema } from "@/shared/api/api-response.schema";

export const notificationTypeSchema = z.enum([
  "NEW_CHAPTER",
  "COMMENT",
  "REPLY_COMMENT",
  "SYSTEM",
]);

export const notificationSchema = z
  .object({
    id: z.number(),
    type: notificationTypeSchema,
    title: z.string(),
    message: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
    targetUrl: z.string().nullable().optional(),
    isRead: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
  })
  .transform(({ targetUrl, ...notification }) => ({
    ...notification,
    url: notification.url ?? targetUrl ?? null,
  }));

export const realtimeNotificationSchema = z.object({
  id: z.number(),
  type: notificationTypeSchema,
  title: z.string(),
  message: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  isRead: z.boolean(),
  createdAt: z.string(),
});

export const notificationsPaginatedSchema = z.object({
  items: z.array(notificationSchema),
  meta: paginationMetaSchema,
});

export const notificationsQuerySchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  unreadOnly: z.boolean().optional(),
});

export const unreadCountSchema = z.object({
  count: z.number(),
});

export const markAllReadResultSchema = z.object({
  updatedCount: z.number(),
});

export const deleteNotificationResultSchema = z.object({
  message: z.string(),
});

export type Notification = z.infer<typeof notificationSchema>;
export type RealtimeNotification = z.infer<typeof realtimeNotificationSchema>;
export type NotificationsPaginated = z.infer<typeof notificationsPaginatedSchema>;
export type NotificationsQuery = z.infer<typeof notificationsQuerySchema>;
export type UnreadCount = z.infer<typeof unreadCountSchema>;
export type MarkAllReadResult = z.infer<typeof markAllReadResultSchema>;
export type DeleteNotificationResult = z.infer<
  typeof deleteNotificationResultSchema
>;
