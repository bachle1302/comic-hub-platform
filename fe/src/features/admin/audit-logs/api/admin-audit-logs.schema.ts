import { z } from "zod";

export const adminAuditActionValues = [
  "CREATE_AUTHOR",
  "UPDATE_AUTHOR",
  "DELETE_AUTHOR",
  "CREATE_CATEGORY",
  "UPDATE_CATEGORY",
  "DELETE_CATEGORY",
  "CREATE_COMIC",
  "UPDATE_COMIC",
  "DELETE_COMIC",
  "CREATE_CHAPTER",
  "UPDATE_CHAPTER",
  "DELETE_CHAPTER",
  "UPLOAD_CHAPTER_IMAGES",
  "DELETE_COMMENT",
  "DELETE_REPORTED_COMMENT",
  "UPDATE_COMMENT_REPORT_STATUS",
  "ADJUST_USER_COIN",
  "BAN_USER",
  "UNBAN_USER",
  "UPDATE_USER",
  "DELETE_USER",
  "SYSTEM",
] as const;

export const adminAuditActionSchema = z.string();

export const adminAuditLogSchema = z.object({
  id: z.number(),
  adminId: z.number().nullable().optional(),
  adminEmail: z.string().nullable().optional(),
  adminName: z.string().nullable().optional(),
  action: adminAuditActionSchema,
  entityType: z.string(),
  entityId: z.string().nullable().optional(),
  message: z.string(),
  metadata: z.unknown().nullable().optional(),
  ip: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const adminAuditLogsMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

export const adminAuditLogsPaginatedSchema = z.object({
  items: z.array(adminAuditLogSchema),
  meta: adminAuditLogsMetaSchema,
});

export const adminAuditLogsQuerySchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  adminId: z.number().optional(),
  action: adminAuditActionSchema.optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  q: z.string().optional(),
});

export type AdminAuditAction = z.infer<typeof adminAuditActionSchema>;
export type AdminAuditLog = z.infer<typeof adminAuditLogSchema>;
export type AdminAuditLogsPaginated = z.infer<
  typeof adminAuditLogsPaginatedSchema
>;
export type AdminAuditLogsQuery = z.infer<typeof adminAuditLogsQuerySchema>;
